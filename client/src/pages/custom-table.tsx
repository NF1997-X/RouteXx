import React, { useState, useMemo, useCallback } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import { useTableData } from "@/hooks/use-table-data";
import { LoadingOverlay } from "@/components/skeleton-loader";
import { Footer } from "@/components/footer";
import { ColumnCustomizationModal } from "@/components/column-customization-modal";
import { RouteOptimizationModal } from "@/components/route-optimization-modal";
import { Database, Info, Eye, PlayCircle } from "lucide-react";
import { calculateDistance } from "@/utils/distance";
import { useToast } from "@/hooks/use-toast";
import type { CustomTable, TableColumn, TableRow } from "@shared/schema";

export default function CustomTableView() {
  const [, params] = useRoute("/custom/:shareId");
  const shareId = params?.shareId;

  // Read preview mode from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const previewMode = urlParams.get('preview') === 'true';

  const { 
    columns,
    rows: allRows = [],
    isLoading,
  } = useTableData();

  // Fetch custom table details
  const { data: customTable, isLoading: isLoadingTable, error } = useQuery<CustomTable>({
    queryKey: [`/api/custom-tables/share/${shareId}`],
    enabled: !!shareId,
  });

  // Fetch custom table rows
  const { data: customTableRows = [], isLoading: isLoadingRows } = useQuery<TableRow[]>({
    queryKey: [`/api/custom-tables/${customTable?.id}/rows`],
    enabled: !!customTable?.id,
  });

  // Ensure QL Kitchen is always included at the top
  const rows = useMemo(() => {
    const qlKitchenRow = allRows.find(row => row.location === "QL Kitchen");
    const hasQLKitchen = customTableRows.some(row => row.location === "QL Kitchen");
    
    if (qlKitchenRow && !hasQLKitchen && customTableRows.length > 0) {
      return [qlKitchenRow, ...customTableRows];
    }
    
    return customTableRows;
  }, [allRows, customTableRows]);

  // Local state for interactive features (delivery filter ONLY - route filter hidden but still applied)
  const [searchTerm, setSearchTerm] = useState("");
  const [deliveryFilters, setDeliveryFilters] = useState<string[]>([]);
  const [routeFilters, setRouteFilters] = useState<string[]>([]);
  const [selectedRowForImage, setSelectedRowForImage] = useState<string | null>(null);
  const [tempRowOrder, setTempRowOrder] = useState<string[]>([]);
  const [tempColumnOrder, setTempColumnOrder] = useState<string[]>([]);
  const [customizationModalOpen, setCustomizationModalOpen] = useState(false);
  const [optimizationModalOpen, setOptimizationModalOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const { toast } = useToast();


  // Apply filters and column visibility
  const { filteredRows, displayColumns, deliveryOptions } = useMemo(() => {
    if (rows.length === 0 || columns.length === 0) {
      return { 
        filteredRows: rows, 
        displayColumns: columns,
        deliveryOptions: []
      };
    }

    // Get unique delivery types
    const deliveries = Array.from(new Set(rows.map(row => row.delivery).filter(Boolean))) as string[];

    // Filter rows (clone to avoid mutating query cache)
    let filtered = [...rows];
    
    // EXCLUDE inactive rows from custom tables (only show active rows)
    filtered = filtered.filter(row => row.active !== false);
    
    // Apply delivery alternate day-based filtering AND code sorting
    const today = new Date().getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    const isAlt1Day = [1, 3, 5, 0].includes(today); // Mon, Wed, Fri, Sun
    const isAlt2Day = [2, 4, 6].includes(today); // Tue, Thu, Sat
    
    // Sort based on delivery alternate (primary) and code (secondary)
    filtered = filtered.sort((a, b) => {
      const aAlt = a.deliveryAlt || "normal";
      const bAlt = b.deliveryAlt || "normal";
      
      // PRIMARY SORT: Delivery alternate priority
      // Inactive always at bottom
      if (aAlt === "inactive" && bAlt !== "inactive") return 1;
      if (aAlt !== "inactive" && bAlt === "inactive") return -1;
      
      // Priority based on day
      if (isAlt1Day) {
        // Alt1 and normal at top, alt2 at bottom
        if ((aAlt === "alt1" || aAlt === "normal") && bAlt === "alt2") return -1;
        if (aAlt === "alt2" && (bAlt === "alt1" || bAlt === "normal")) return 1;
      } else if (isAlt2Day) {
        // Alt2 and normal at top, alt1 at bottom
        if ((aAlt === "alt2" || aAlt === "normal") && bAlt === "alt1") return -1;
        if (aAlt === "alt1" && (bAlt === "alt2" || bAlt === "normal")) return 1;
      }
      
      // SECONDARY SORT: Code column (less to greater / ascending)
      const codeA = a.code || "";
      const codeB = b.code || "";
      return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
    });
    
    // Apply route filters
    if (routeFilters.length > 0) {
      filtered = filtered.filter(row => routeFilters.includes(row.route));
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(row => 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply delivery filters (hide selected types)
    if (deliveryFilters.length > 0) {
      filtered = filtered.filter(row => !deliveryFilters.includes(row.delivery));
    }

    // Use all columns as visible, but hide latitude, longitude, and tollPrice (not in edit mode)
    let visibleCols = columns.filter(col => 
      col.dataKey !== 'latitude' && col.dataKey !== 'longitude' && col.dataKey !== 'tollPrice'
    );

    // Make sure kilometer column is included if it exists
    const hasKilometerCol = visibleCols.some(col => col.dataKey === 'kilometer');
    if (!hasKilometerCol) {
      // Add kilometer column if not present
      const kilometerCol = columns.find(col => col.dataKey === 'kilometer');
      if (kilometerCol) {
        visibleCols = [...visibleCols, kilometerCol];
      }
    }

    return { 
      filteredRows: filtered, 
      displayColumns: visibleCols,
      deliveryOptions: deliveries
    };
  }, [rows, columns, searchTerm, deliveryFilters, routeFilters]);

  // Calculate distances for kilometer column
  const rowsWithDistances = useMemo(() => {
    // Find QL Kitchen coordinates from full rows collection
    const qlKitchenRow = rows.find(row => row.location === "QL Kitchen");
    
    if (!qlKitchenRow || !qlKitchenRow.latitude || !qlKitchenRow.longitude) {
      return filteredRows.map(row => ({ ...row, kilometer: "—", segmentDistance: 0 }));
    }

    const qlLat = parseFloat(qlKitchenRow.latitude);
    const qlLng = parseFloat(qlKitchenRow.longitude);

    if (!Number.isFinite(qlLat) || !Number.isFinite(qlLng)) {
      return filteredRows.map(row => ({ ...row, kilometer: "—", segmentDistance: 0 }));
    }

    // Check if any filters are active
    const hasActiveFilters = searchTerm !== "" || routeFilters.length > 0 || deliveryFilters.length > 0;

    if (!hasActiveFilters) {
      // NO FILTERS: Calculate direct distance from QL Kitchen to each route
      return filteredRows.map((row) => {
        if (row.location === "QL Kitchen") {
          return { ...row, kilometer: 0, segmentDistance: 0 };
        }

        if (!row.latitude || !row.longitude) {
          return { ...row, kilometer: "—", segmentDistance: 0 };
        }

        const currentLat = parseFloat(row.latitude);
        const currentLng = parseFloat(row.longitude);

        if (!Number.isFinite(currentLat) || !Number.isFinite(currentLng)) {
          return { ...row, kilometer: "—", segmentDistance: 0 };
        }

        const directDistance = calculateDistance(qlLat, qlLng, currentLat, currentLng);
        return { ...row, kilometer: directDistance, segmentDistance: directDistance };
      });
    } else {
      // FILTERS ACTIVE: Calculate cumulative distance
      let cumulativeDistance = 0;
      let previousLat = qlLat;
      let previousLng = qlLng;

      return filteredRows.map((row) => {
        if (row.location === "QL Kitchen") {
          cumulativeDistance = 0;
          previousLat = qlLat;
          previousLng = qlLng;
          return { ...row, kilometer: 0, segmentDistance: 0 };
        }

        if (!row.latitude || !row.longitude) {
          return { ...row, kilometer: "—", segmentDistance: 0 };
        }

        const currentLat = parseFloat(row.latitude);
        const currentLng = parseFloat(row.longitude);

        if (!Number.isFinite(currentLat) || !Number.isFinite(currentLng)) {
          return { ...row, kilometer: "—", segmentDistance: 0 };
        }

        const segmentDistance = calculateDistance(previousLat, previousLng, currentLat, currentLng);
        cumulativeDistance += segmentDistance;

        previousLat = currentLat;
        previousLng = currentLng;

        return { ...row, kilometer: cumulativeDistance, segmentDistance };
      });
    }
  }, [rows, filteredRows, searchTerm, routeFilters, deliveryFilters]);

  // Create read-only mutations (they work but don't persist)
  const readOnlyUpdateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<any> }) => {
      console.log("Read-only mode: Changes not saved", data);
      return data;
    },
  });

  const readOnlyDeleteMutation = useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      console.log("Read-only mode: Delete not allowed", id);
    },
  });

  const readOnlyReorderRowsMutation = useMutation<TableRow[], Error, string[]>({
    mutationFn: async (rowIds: string[]) => {
      if (previewMode) {
        setTempRowOrder(rowIds);
      }
      
      const reordered = rowIds
        .map(id => rows.find(r => r.id === id))
        .filter((r): r is TableRow => r !== undefined);
      return reordered;
    },
  });

  const readOnlyReorderColumnsMutation = useMutation<TableColumn[], Error, string[]>({
    mutationFn: async (columnIds: string[]) => {
      if (previewMode) {
        setTempColumnOrder(columnIds);
      }
      
      const reordered = columnIds
        .map(id => columns.find(c => c.id === id))
        .filter((c): c is TableColumn => c !== undefined);
      return reordered;
    },
  });

  const readOnlyDeleteColumnMutation = useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      console.log("Read-only mode: Column delete not allowed", id);
    },
  });

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setDeliveryFilters([]);
  };

  // Handle column customization in preview mode
  const handleApplyColumnCustomization = (newVisibleColumns: string[]) => {
    if (previewMode) {
      setVisibleColumns(newVisibleColumns);
      toast({
        title: "Preview Mode",
        description: "Column visibility changed temporarily. Changes won't be saved.",
        duration: 3000,
      });
    }
  };

  // Handle route optimization in preview mode
  const handleApplyRouteOptimization = (rowIds: string[]) => {
    if (previewMode) {
      setTempRowOrder(rowIds);
    }
  };

  // Apply temp order to preserve calculated data (kilometer, segment distance)
  const displayRows = useMemo(() => {
    if (previewMode && tempRowOrder.length > 0) {
      return tempRowOrder
        .map(id => rowsWithDistances.find(r => r.id === id))
        .filter((r): r is typeof rowsWithDistances[number] => r !== undefined);
    }
    return rowsWithDistances;
  }, [previewMode, tempRowOrder, rowsWithDistances]);

  // Initialize visibleColumns with all columns when columns load
  React.useEffect(() => {
    if (columns.length > 0 && visibleColumns.length === 0) {
      setVisibleColumns(columns.map(c => c.id));
    }
  }, [columns]);

  const displayColumnsOrdered = useMemo(() => {
    let cols = displayColumns;
    
    // Apply temp column order if preview mode
    if (previewMode && tempColumnOrder.length > 0) {
      cols = tempColumnOrder
        .map(id => displayColumns.find(c => c.id === id))
        .filter((c): c is typeof displayColumns[number] => c !== undefined);
    }
    
    // Apply visible columns filter if preview mode and visibleColumns is set
    if (previewMode && visibleColumns.length > 0) {
      cols = cols.filter(c => visibleColumns.includes(c.id));
    }
    
    return cols;
  }, [previewMode, tempColumnOrder, displayColumns, visibleColumns]);

  // Smart loading - intro vs navigation
  const [minLoadingComplete, setMinLoadingComplete] = React.useState(false);
  const [isIntroLoading, setIsIntroLoading] = React.useState(false);

  React.useEffect(() => {
    // Check if this is first app launch or navigation
    const hasLoadedBefore = sessionStorage.getItem('routevm_loaded');
    
    if (hasLoadedBefore) {
      // Navigation loading - fast 1 second
      setIsIntroLoading(false);
      const timer = setTimeout(() => {
        setMinLoadingComplete(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Intro loading - full 5 seconds with fancy animation
      setIsIntroLoading(true);
      const timer = setTimeout(() => {
        setMinLoadingComplete(true);
        sessionStorage.setItem('routevm_loaded', 'true');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Clear sessionStorage when user leaves (tab close, minimize, switch app, refresh)
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('routevm_loaded');
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched away from tab or minimized
        sessionStorage.removeItem('routevm_loaded');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Show loading overlay
  if (isLoading || isLoadingTable || isLoadingRows || !minLoadingComplete) {
    return (
      <div className="min-h-screen relative">
        {isIntroLoading ? (
          <LoadingOverlay message="Loading Custom Table..." type="ripple" />
        ) : (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Loading...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (error || !customTable) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
            <Database className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Custom Table Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            The custom table you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b-2 border-blue-500/50 dark:border-blue-400/50 bg-gradient-to-r from-blue-500/10 via-blue-600/10 to-blue-700/10 dark:from-blue-500/20 dark:via-blue-600/20 dark:to-blue-700/20 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg shadow-blue-500/20">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between text-[12px]">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="flex h-8 w-8 items-center justify-center rounded-none overflow-hidden">
                  <img 
                    src="/assets/Logofm.png" 
                    alt="Logo" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="font-bold text-slate-600 dark:text-slate-300 text-[12px]">
                  {customTable.name}
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Custom Table View
            </div>
          </div>
        </div>
      </nav>

      {/* Mode Banner */}
      <div className="fixed top-[56px] left-0 right-0 z-40 bg-gradient-to-r from-blue-500/90 via-blue-600/90 to-blue-700/90 dark:from-blue-600/90 dark:via-blue-700/90 dark:to-blue-800/90 backdrop-blur-sm border-b-2 border-blue-400/50 dark:border-blue-500/50 shadow-lg">
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex items-center justify-center gap-2 text-white">
            {previewMode ? (
              <>
                <PlayCircle className="h-4 w-4 flex-shrink-0 animate-pulse" />
                <span className="text-xs font-medium">
                  🎮 Preview Mode: Interactive playground - changes are temporary and won't be saved
                </span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs font-medium">
                  📖 Read-Only Mode: View only, no interactions
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <main className="pt-[96px]">
        <div className="container mx-auto px-4 py-8">
          {/* Info Banner - Delivery OFF, Expired Color */}
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border-2 border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm shadow-md">
            <div className="flex flex-col gap-3 text-xs">
              {/* Delivery OFF Status */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-blue-900 dark:text-blue-100">
                  🗓️ Delivery OFF:
                </span>
                <span className="text-blue-800 dark:text-blue-200 font-medium">
                  {(() => {
                    const today = new Date().getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
                    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    const isAlt1Day = [1, 3, 5, 0].includes(today); // Mon, Wed, Fri, Sun
                    const isAlt2Day = [2, 4, 6].includes(today); // Tue, Thu, Sat
                    
                    if (isAlt1Day) {
                      return `Alt 2 (${dayNames[today]})`;
                    } else if (isAlt2Day) {
                      return `Alt 1 (${dayNames[today]})`;
                    }
                    return dayNames[today];
                  })()}
                </span>
              </div>
              
              {/* Expired Color Indicator */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-blue-900 dark:text-blue-100 flex-shrink-0">
                  🚫 Expired Color:
                </span>
                <div className="flex items-center gap-1.5">
                  {(() => {
                    const today = new Date().getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
                    const dayColors = [
                      { name: 'Purple', bg: 'bg-purple-400', border: 'border-purple-600' },
                      { name: 'Pink', bg: 'bg-pink-400', border: 'border-pink-600' },
                      { name: 'Yellow', bg: 'bg-yellow-400', border: 'border-yellow-600' },
                      { name: 'Blue', bg: 'bg-blue-400', border: 'border-blue-600' },
                      { name: 'Orange', bg: 'bg-orange-400', border: 'border-orange-600' },
                      { name: 'Brown', bg: 'bg-amber-700', border: 'border-amber-900' },
                      { name: 'Green', bg: 'bg-green-400', border: 'border-green-600' }
                    ];
                    const todayColor = dayColors[today];
                    return (
                      <>
                        <div className={`w-3 h-3 rounded-full ${todayColor.bg} border ${todayColor.border} shadow-sm`}></div>
                        <span className="text-blue-800 dark:text-blue-200 font-medium">{todayColor.name}</span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Data Table with conditional interactive features based on preview mode */}
          <DataTable
            rows={displayRows}
            columns={displayColumnsOrdered}
            editMode={false}
            isSharedView={true}
            hideShareButton={true}
            disablePagination={true}
            onUpdateRow={readOnlyUpdateMutation as any}
            onDeleteRow={readOnlyDeleteMutation as any}
            onReorderRows={readOnlyReorderRowsMutation as any}
            onReorderColumns={readOnlyReorderColumnsMutation as any}
            onDeleteColumn={readOnlyDeleteColumnMutation as any}
            onSelectRowForImage={setSelectedRowForImage}
            onShowCustomization={previewMode ? () => setCustomizationModalOpen(true) : () => {}}
            onOptimizeRoute={previewMode ? () => setOptimizationModalOpen(true) : () => {}}
            isAuthenticated={false}
            searchTerm={previewMode ? searchTerm : ""}
            onSearchTermChange={previewMode ? setSearchTerm : () => {}}
            filterValue={[]}
            onFilterValueChange={() => {}}
            deliveryFilterValue={previewMode ? deliveryFilters : []}
            onDeliveryFilterValueChange={previewMode ? setDeliveryFilters : () => {}}
            routeOptions={[]}
            deliveryOptions={previewMode ? deliveryOptions : []}
            onClearAllFilters={previewMode ? handleClearAllFilters : () => {}}
            filteredRowsCount={rowsWithDistances.length}
            totalRowsCount={rows.length}
          />
        </div>
      </main>

      <Footer editMode={false} />

      {/* Column Customization Modal */}
      {previewMode && (
        <ColumnCustomizationModal
          open={customizationModalOpen}
          onOpenChange={setCustomizationModalOpen}
          columns={columns}
          visibleColumns={visibleColumns}
          onApplyChanges={handleApplyColumnCustomization}
          editMode={false}
        />
      )}

      {/* Route Optimization Modal */}
      {previewMode && (
        <RouteOptimizationModal
          open={optimizationModalOpen}
          onOpenChange={setOptimizationModalOpen}
          rows={displayRows}
          previewMode={previewMode}
          onApplyTempOrder={handleApplyRouteOptimization}
        />
      )}
    </>
  );
}
