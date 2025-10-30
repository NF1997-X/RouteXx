import React, { useEffect, useState, useMemo } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import { useTableData } from "@/hooks/use-table-data";
import { LoadingOverlay } from "@/components/skeleton-loader";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { PasswordPrompt } from "@/components/password-prompt";
import { Database } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { calculateDistance } from "@/utils/distance";
import type { SharedTableState, TableColumn, TableRow } from "@shared/schema";

export default function SharedTablePage() {
  const [, params] = useRoute("/share/:shareId");
  const shareId = params?.shareId;
  const { theme, toggleTheme } = useTheme();

  const { 
    rows, 
    columns, 
    isLoading,
  } = useTableData();

  // Fetch shared table state
  const { data: sharedState, isLoading: isLoadingState, error } = useQuery<SharedTableState>({
    queryKey: ['/api/share-table', shareId],
    enabled: !!shareId,
  });

  // Get remark from shared state (accessible to all viewers)
  const tableRemark = sharedState?.remark || "";

  // Local state for interactive features (delivery filter ONLY - route filter hidden but still applied)
  const [searchTerm, setSearchTerm] = useState("");
  const [deliveryFilters, setDeliveryFilters] = useState<string[]>([]);
  const [routeFilters, setRouteFilters] = useState<string[]>([]); // Hidden but applied from shared state
  const [selectedRowForImage, setSelectedRowForImage] = useState<string | null>(null);
  
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [editModeLoading, setEditModeLoading] = useState(false);

  // Initialize filters from shared state
  useEffect(() => {
    if (sharedState?.tableState) {
      setSearchTerm(sharedState.tableState.filters.searchTerm || "");
      setDeliveryFilters(sharedState.tableState.filters.deliveryFilters || []);
      setRouteFilters(sharedState.tableState.filters.routeFilters || []); // Apply route filters from shared state
    }
  }, [sharedState]);

  // Apply filters and column visibility from shared state + local state
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
    
    // Apply delivery alternate day-based filtering
    const today = new Date().getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    const isAlt1Day = [1, 3, 5, 0].includes(today); // Mon, Wed, Fri, Sun
    const isAlt2Day = [2, 4, 6].includes(today); // Tue, Thu, Sat
    
    // Sort based on delivery alternate and current day
    filtered = filtered.sort((a, b) => {
      const aAlt = a.deliveryAlt || "normal";
      const bAlt = b.deliveryAlt || "normal";
      
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
      
      return 0;
    });
    
    // Apply route filters from shared state (hidden but applied)
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

    // Filter and reorder columns based on shared state
    let visibleCols = columns;
    if (sharedState?.tableState) {
      const { columnVisibility, columnOrder } = sharedState.tableState;
      // Note: columnVisibility only stores hidden columns (false), visible ones are undefined
      visibleCols = columns.filter(col => columnVisibility[col.id] !== false);
      const orderedCols = columnOrder
        .map(id => visibleCols.find(col => col.id === id))
        .filter((col): col is TableColumn => col !== undefined);
      visibleCols = orderedCols;
    }

    // Hide latitude, longitude, and tollPrice columns (not in edit mode)
    visibleCols = visibleCols.filter(col => 
      col.dataKey !== 'latitude' && col.dataKey !== 'longitude' && col.dataKey !== 'tollPrice'
    );

    return { 
      filteredRows: filtered, 
      displayColumns: visibleCols,
      deliveryOptions: deliveries
    };
  }, [rows, columns, sharedState, searchTerm, deliveryFilters, routeFilters]);

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
      const reordered = rowIds
        .map(id => rows.find(r => r.id === id))
        .filter((r): r is TableRow => r !== undefined);
      return reordered;
    },
  });

  const readOnlyReorderColumnsMutation = useMutation<TableColumn[], Error, string[]>({
    mutationFn: async (columnIds: string[]) => {
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

  // Edit mode handlers
  const handleEditModeRequest = async () => {
    if (editMode) {
      // Exit edit mode
      setEditModeLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEditMode(false);
      setIsAuthenticated(false);
      setEditModeLoading(false);
    } else {
      // Enter edit mode - require password
      if (!isAuthenticated) {
        setShowPasswordPrompt(true);
      } else {
        setEditModeLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEditModeLoading(false);
        setEditMode(true);
      }
    }
  };

  const handlePasswordSuccess = async () => {
    setIsAuthenticated(true);
    setShowPasswordPrompt(false);
    setEditModeLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setEditModeLoading(false);
    setEditMode(true);
  };

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
  if (isLoading || isLoadingState || !minLoadingComplete) {
    return (
      <div className="min-h-screen relative">
        {isIntroLoading ? (
          <LoadingOverlay message="Loading shared table..." type="wave" />
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

  if (error || !sharedState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
            <Database className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Shared Table Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            The shared table you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Edit Mode Loading Overlay */}
      {editModeLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50/95 to-slate-100/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Loading...</p>
          </div>
        </div>
      )}

      {/* Simple Header - Same as Custom Table */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b-2 border-blue-500/50 dark:border-blue-400/50 bg-gradient-to-r from-blue-500/10 via-blue-600/10 to-blue-700/10 dark:from-blue-500/20 dark:via-blue-600/20 dark:to-blue-700/20 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg shadow-blue-500/20">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between text-[12px]">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden">
                  <img 
                    src="/assets/Logofm.png" 
                    alt="Logo" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="font-bold text-slate-600 dark:text-slate-300 text-[12px]">
                  {tableRemark || "Shared Table"}
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Shared View
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-[56px]">
        <div className="container mx-auto px-4 py-8">
          {/* Route Filter Info Banner */}
          {routeFilters.length > 0 && (
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border-2 border-transparent">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                  📍 Showing Routes: {routeFilters.join(', ')}
                </span>
              </div>
            </div>
          )}
          
          {/* Data Table with all interactive features enabled */}
          <DataTable
            rows={rowsWithDistances}
            columns={displayColumns}
            editMode={editMode}
            isSharedView={true}
            hideShareButton={true}
            disablePagination={true}
            onUpdateRow={readOnlyUpdateMutation as any}
            onDeleteRow={readOnlyDeleteMutation as any}
            onReorderRows={readOnlyReorderRowsMutation as any}
            onReorderColumns={readOnlyReorderColumnsMutation as any}
            onDeleteColumn={readOnlyDeleteColumnMutation as any}
            onSelectRowForImage={setSelectedRowForImage}
            onShowCustomization={() => {}}
            onOptimizeRoute={() => {}}
            isAuthenticated={isAuthenticated}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            filterValue={[]}
            onFilterValueChange={() => {}}
            deliveryFilterValue={deliveryFilters}
            onDeliveryFilterValueChange={setDeliveryFilters}
            routeOptions={[]}
            deliveryOptions={deliveryOptions}
            onClearAllFilters={handleClearAllFilters}
            filteredRowsCount={rowsWithDistances.length}
            totalRowsCount={rows.length}
          />
        </div>
      </main>

      <Footer editMode={editMode} />

      {/* Password Prompt Dialog */}
      <PasswordPrompt
        open={showPasswordPrompt}
        onOpenChange={setShowPasswordPrompt}
        onSuccess={handlePasswordSuccess}
        title="Enter Password to Edit"
        description="Please enter your password to enable edit mode on this shared table."
      />
    </>
  );
}
