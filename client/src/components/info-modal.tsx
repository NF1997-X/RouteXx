import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info, ListChecks, QrCode, ExternalLink, CheckCircle, Save, X, FileText, Loader2 } from "lucide-react";
import { SiGooglemaps, SiWaze } from "react-icons/si";
import { MiniMap } from "@/components/mini-map";
import { SlidingDescription } from "@/components/sliding-description";
import { EditableDescriptionList } from "@/components/editable-description-list";
import QrScanner from "qr-scanner";

interface InfoModalProps {
  info: string;
  rowId: string;
  code?: string;
  route?: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  qrCode?: string;
  no?: number;
  markerColor?: string;
  onUpdateRow?: (updates: any) => void;
  editMode?: boolean;
  allRows?: any[];
  iconType?: 'info' | 'filetext';
}

export function InfoModal({ info, rowId, code, route, location, latitude, longitude, qrCode, no, markerColor, onUpdateRow, editMode = false, allRows = [], iconType = 'info' }: InfoModalProps) {
  const [open, setOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [scannedResult, setScannedResult] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [showChecklistConfirm, setShowChecklistConfirm] = useState(false);
  const [showNavigationConfirm, setShowNavigationConfirm] = useState(false);
  const [navigationType, setNavigationType] = useState<'google' | 'waze'>('google');
  const [showUrlConfirm, setShowUrlConfirm] = useState(false);
  const [urlToOpen, setUrlToOpen] = useState<string>("");
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // State for tracking edits
  const [originalData, setOriginalData] = useState({ info: "", qrCode: "", latitude: "", longitude: "", markerColor: "" });
  const [currentData, setCurrentData] = useState({ info: "", qrCode: "", latitude: "", longitude: "", markerColor: "" });
  
  // Initialize data when modal opens
  useEffect(() => {
    if (open) {
      const data = {
        info: info || "",
        qrCode: qrCode || "",
        latitude: latitude || "",
        longitude: longitude || "",
        markerColor: markerColor || "#3388ff"
      };
      setOriginalData(data);
      setCurrentData(data);
    }
  }, [open, info, qrCode, latitude, longitude, markerColor]);
  
  // Check if there are any changes
  const hasChanges = () => {
    return (
      currentData.info !== originalData.info ||
      currentData.qrCode !== originalData.qrCode ||
      currentData.latitude !== originalData.latitude ||
      currentData.longitude !== originalData.longitude ||
      currentData.markerColor !== originalData.markerColor
    );
  };

  // Format code to 4 digits with leading zeros
  const formatCode = (codeValue?: string) => {
    if (!codeValue) return '0000';
    const numericCode = parseInt(codeValue.replace(/\D/g, ''), 10) || 0;
    return numericCode.toString().padStart(4, '0');
  };

  const handleEditClick = () => {
    setShowChecklistConfirm(true);
  };

  const handleConfirmEditClick = () => {
    const formattedCode = formatCode(code);
    const editUrl = `https://fmvending.web.app/refill-service/M${formattedCode}`;
    window.open(editUrl, '_blank');
    setShowChecklistConfirm(false);
  };

  const handleDirectionClick = () => {
    setNavigationType('google');
    setShowNavigationConfirm(true);
  };

  const handleConfirmDirectionClick = () => {
    if (latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude))) {
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      window.open(directionsUrl, '_blank');
    }
    setShowNavigationConfirm(false);
  };

  const handleWazeClick = () => {
    setNavigationType('waze');
    setShowNavigationConfirm(true);
  };

  const handleConfirmWazeClick = () => {
    if (latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude))) {
      const wazeUrl = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
      window.open(wazeUrl, '_blank');
    }
    setShowNavigationConfirm(false);
  };

  const handleQrCodeClick = async () => {
    if (!qrCode) return;

    setIsScanning(true);
    try {
      let imageSource: string | Blob = qrCode;

      // If it's a remote URL, use our proxy to avoid CORS issues
      if (qrCode.startsWith('http')) {
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(qrCode)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) {
          throw new Error(`Failed to load image: ${response.statusText}`);
        }
        imageSource = await response.blob();
      }

      // Try to decode QR code from the image
      const result = await QrScanner.scanImage(imageSource, { returnDetailedScanResult: true });
      setScannedResult(result.data);
      setShowConfirmDialog(true);
    } catch (error) {
      console.error("QR scanning error:", error);
      // Show error toast instead of incorrect navigation
      alert("Could not read QR code from the image. Please check if the image contains a valid QR code.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirmNavigation = () => {
    if (scannedResult) {
      // Check if it's a valid URL, if not, treat it as a search query
      let targetUrl = scannedResult;
      
      // If it doesn't start with http/https, assume it's a search or add https
      if (!scannedResult.match(/^https?:\/\//)) {
        // If it looks like a URL without protocol, add https
        if (scannedResult.includes('.') && !scannedResult.includes(' ')) {
          targetUrl = `https://${scannedResult}`;
        } else {
          // Otherwise, search on Google
          targetUrl = `https://www.google.com/search?q=${encodeURIComponent(scannedResult)}`;
        }
      }
      
      window.open(targetUrl, '_blank');
    }
    setShowConfirmDialog(false);
    setScannedResult("");
  };

  const handleCancelNavigation = () => {
    setShowConfirmDialog(false);
    setScannedResult("");
  };

  const handleUrlClick = (url: string) => {
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }
    setUrlToOpen(targetUrl);
    setShowUrlConfirm(true);
  };

  const handleConfirmUrlOpen = () => {
    if (urlToOpen) {
      window.open(urlToOpen, '_blank');
    }
    setShowUrlConfirm(false);
    setUrlToOpen("");
  };
  
  const handleSaveClick = () => {
    if (hasChanges()) {
      setShowSaveConfirm(true);
    }
  };

  const handleConfirmSave = async () => {
    setShowSaveConfirm(false);
    setIsSaving(true);
    
    try {
      if (hasChanges() && onUpdateRow) {
        const updates: any = {};
        
        if (currentData.info !== originalData.info) {
          updates.info = currentData.info;
        }
        if (currentData.qrCode !== originalData.qrCode) {
          updates.qrCode = currentData.qrCode || null;
        }
        if (currentData.latitude !== originalData.latitude) {
          updates.latitude = currentData.latitude ? parseFloat(currentData.latitude) : null;
        }
        if (currentData.longitude !== originalData.longitude) {
          updates.longitude = currentData.longitude ? parseFloat(currentData.longitude) : null;
        }
        if (currentData.markerColor !== originalData.markerColor) {
          updates.markerColor = currentData.markerColor;
        }
        
        await onUpdateRow(updates);
        
        // Update original data to reflect saved changes
        setOriginalData(currentData);
        
        // Show success message (keep modal open so user can see changes in the map)
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    // Revert to original data
    setCurrentData(originalData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-1 bg-transparent border-transparent hover:bg-transparent hover:border-transparent text-blue-400 hover:text-blue-500 dark:text-blue-300 dark:hover:text-blue-400"
          data-testid={`button-info-${rowId}`}
        >
          {editMode ? (
            <Info className="w-4 h-4" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="max-w-lg overflow-hidden flex flex-col bg-white/70 dark:bg-black/30 backdrop-blur-2xl border-2 border-gray-200/60 dark:border-white/10 shadow-[0_20px_60px_0_rgba(0,0,0,0.25)] rounded-3xl transition-smooth data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-90 data-[state=open]:zoom-in-95 duration-300 ease-out"
        style={{
          maxHeight: 'min(90vh, calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 40px))',
          touchAction: 'pan-y',
        }}
      >
        {/* iOS Frosted Glass Layer */}
        <div 
          className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-white/60 via-white/40 to-white/50 dark:from-black/40 dark:via-black/20 dark:to-black/30 border-0 shadow-inner" 
          style={{
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
          }}
        />
        <DialogHeader 
          className="pb-6 border-b border-blue-900 dark:border-cyan-400/50 flex-shrink-0"
          style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
        >
          <DialogTitle className="font-semibold text-center text-slate-900 dark:text-slate-400" style={{fontSize: '10px'}}>
            {location || 'Location'}
          </DialogTitle>
          <div className="text-center text-muted-foreground pt-2" style={{fontSize: '10px'}}>
            {code || ''}
          </div>
        </DialogHeader>
        
        <div 
          className="py-6 space-y-6 overflow-y-auto flex-1"
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
          }}
        >
          {/* Mini Map Section */}
          {latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude)) && (
            <div className="bg-transparent backdrop-blur-sm rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 dark:bg-green-300 rounded-full animate-pulse"></div>
                <h4 className="font-semibold text-green-500 dark:text-green-300" style={{fontSize: '10px'}}>🗺️ Location Map</h4>
              </div>
              <MiniMap 
                locations={(() => {
                  const currentLocation = {
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                    label: location || 'Location',
                    code: route || code,
                    isCurrent: true,
                    markerColor: currentData.markerColor || markerColor
                  };
                  
                  // For fullscreen: collect all locations from allRows with valid coordinates
                  const allLocations = allRows
                    .filter(row => 
                      row.latitude && 
                      row.longitude && 
                      !isNaN(parseFloat(String(row.latitude))) && 
                      !isNaN(parseFloat(String(row.longitude)))
                    )
                    .map(row => ({
                      latitude: parseFloat(String(row.latitude)),
                      longitude: parseFloat(String(row.longitude)),
                      label: row.location || 'Location',
                      code: row.route || row.code,
                      isCurrent: row.id === rowId,
                      markerColor: row.markerColor
                    }));
                  
                  // For mini view, show only current location
                  // For fullscreen, it will show all locations
                  return allLocations.length > 1 ? allLocations : [currentLocation];
                })()}
                height="160px"
                showFullscreenButton={true}
              />
              
              {/* Full Address Caption */}
              <div className="mt-3 pt-3 border-t border-blue-200/50 dark:border-white/10">
                <SlidingDescription
                  value={(() => {
                    const infoValue = currentData.info || "";
                    if (!infoValue) return "";
                    if (infoValue.includes("|||DESCRIPTION|||")) {
                      return infoValue.split("|||DESCRIPTION|||")[0] || "";
                    }
                    return infoValue;
                  })()}
                  onSave={(value) => {
                    const currentInfo = currentData.info || "";
                    let newInfo = value;
                    
                    // Preserve description if it exists
                    if (currentInfo.includes("|||DESCRIPTION|||")) {
                      const description = currentInfo.split("|||DESCRIPTION|||")[1] || "";
                      if (description.trim()) {
                        newInfo = `${value}|||DESCRIPTION|||${description}`;
                      }
                    }
                    
                    setCurrentData(prev => ({ ...prev, info: newInfo }));
                  }}
                  isEditable={editMode}
                />
              </div>
            </div>
          )}

          {/* Description Section */}
          <div className="bg-transparent backdrop-blur-sm rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full"></div>
              <h4 className="font-semibold text-purple-600 dark:text-purple-400" style={{fontSize: '10px'}}>📝 Description</h4>
            </div>
            <EditableDescriptionList
              value={(() => {
                const infoValue = currentData.info || "";
                if (!infoValue) return "";
                if (infoValue.includes("|||DESCRIPTION|||")) {
                  const withDescription = infoValue.split("|||DESCRIPTION|||")[1] || "";
                  if (withDescription.includes("|||URL|||")) {
                    return withDescription.split("|||URL|||")[0] || "";
                  }
                  return withDescription;
                }
                return "";
              })()}
              onSave={(value) => {
                const currentInfo = currentData.info || "";
                let address = "";
                let url = "";
                
                // Parse current info to extract address and URL
                if (currentInfo.includes("|||DESCRIPTION|||")) {
                  address = currentInfo.split("|||DESCRIPTION|||")[0] || "";
                  const descriptionPart = currentInfo.split("|||DESCRIPTION|||")[1] || "";
                  if (descriptionPart.includes("|||URL|||")) {
                    url = descriptionPart.split("|||URL|||")[1] || "";
                  }
                } else {
                  // If no description separator, check for URL separator
                  if (currentInfo.includes("|||URL|||")) {
                    address = currentInfo.split("|||URL|||")[0] || "";
                    url = currentInfo.split("|||URL|||")[1] || "";
                  } else {
                    address = currentInfo;
                  }
                }
                
                // Rebuild info with updated description
                let newInfo = address.trim();
                
                // Add description if it has content
                if (value.trim()) {
                  newInfo += `|||DESCRIPTION|||${value.trim()}`;
                }
                
                // Add URL if it exists
                if (url.trim()) {
                  // If we have description, append URL to it
                  if (value.trim()) {
                    newInfo += `|||URL|||${url.trim()}`;
                  } else {
                    // If no description but have URL, add it directly
                    newInfo += `|||DESCRIPTION||||||URL|||${url.trim()}`;
                  }
                }
                
                setCurrentData(prev => ({ ...prev, info: newInfo }));
              }}
              isEditable={editMode}
            />
          </div>

          {/* URL Section - Only show in edit mode */}
          {editMode && (
            <div className="bg-transparent backdrop-blur-sm rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-500 dark:bg-cyan-400 rounded-full"></div>
                <h4 className="font-semibold text-cyan-600 dark:text-cyan-400" style={{fontSize: '10px'}}>🌐 Website URL</h4>
              </div>
              <SlidingDescription
                value={(() => {
                  const infoValue = currentData.info || "";
                  if (!infoValue) return "";
                  if (infoValue.includes("|||URL|||")) {
                    return infoValue.split("|||URL|||").pop() || "";
                  }
                  return "";
                })()}
                onSave={(value) => {
                  const currentInfo = currentData.info || "";
                  let address = "";
                  let description = "";
                  
                  // Parse current info
                  if (currentInfo.includes("|||DESCRIPTION|||")) {
                    address = currentInfo.split("|||DESCRIPTION|||")[0] || "";
                    const descriptionPart = currentInfo.split("|||DESCRIPTION|||")[1] || "";
                    if (descriptionPart.includes("|||URL|||")) {
                      description = descriptionPart.split("|||URL|||")[0] || "";
                    } else {
                      description = descriptionPart;
                    }
                  } else {
                    address = currentInfo;
                  }
                  
                  // Combine with new URL
                  let newInfo = address;
                  if (description.trim() || value.trim()) {
                    newInfo += `|||DESCRIPTION|||${description}`;
                    if (value.trim()) {
                      newInfo += `|||URL|||${value}`;
                    }
                  }
                  
                  setCurrentData(prev => ({ ...prev, info: newInfo }));
                }}
                isEditable={editMode}
              />
            </div>
          )}

          {/* QR Code URL Section - Only show in edit mode */}
          {editMode && (
            <div className="bg-transparent backdrop-blur-sm rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full"></div>
                <h4 className="font-semibold text-purple-600 dark:text-purple-400" style={{fontSize: '10px'}}><QrCode className="w-4 h-4 inline mr-1" />QR Code URL</h4>
              </div>
              <div className="space-y-2">
                <Input
                  value={currentData.qrCode}
                  onChange={(e) => setCurrentData(prev => ({ ...prev, qrCode: e.target.value }))}
                  placeholder="Enter QR code image URL..."
                  style={{fontSize: '10px'}}
                  data-testid="input-qr-code"
                />
                <p className="text-muted-foreground" style={{fontSize: '10px'}}>URL to the QR code image</p>
              </div>
            </div>
          )}

          {/* Location Coordinates Section - Only show in edit mode */}
          {editMode && (
            <div className="bg-transparent backdrop-blur-sm rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                <h4 className="font-semibold text-green-600 dark:text-green-400" style={{fontSize: '10px'}}>📍 Coordinates</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="latitude" style={{fontSize: '10px'}}>Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={currentData.latitude}
                    onChange={(e) => setCurrentData(prev => ({ ...prev, latitude: e.target.value }))}
                    placeholder="e.g., 3.1390"
                    style={{fontSize: '10px'}}
                    data-testid="input-latitude"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude" style={{fontSize: '10px'}}>Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={currentData.longitude}
                    onChange={(e) => setCurrentData(prev => ({ ...prev, longitude: e.target.value }))}
                    placeholder="e.g., 101.6869"
                    style={{fontSize: '10px'}}
                    data-testid="input-longitude"
                  />
                </div>
              </div>
              <p className="text-muted-foreground" style={{fontSize: '10px'}}>GPS coordinates for map location</p>
              
              {/* Marker Color Picker */}
              <div className="space-y-2 pt-3">
                <Label htmlFor="markerColor" style={{fontSize: '10px'}}>🎨 Marker Color</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="markerColor"
                    type="color"
                    value={currentData.markerColor}
                    onChange={(e) => setCurrentData(prev => ({ ...prev, markerColor: e.target.value }))}
                    className="w-20 h-10 cursor-pointer"
                    data-testid="input-marker-color"
                  />
                  <Input
                    type="text"
                    value={currentData.markerColor}
                    onChange={(e) => setCurrentData(prev => ({ ...prev, markerColor: e.target.value }))}
                    placeholder="#3b82f6"
                    className="flex-1"
                    style={{fontSize: '10px'}}
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
                <p className="text-muted-foreground" style={{fontSize: '10px'}}>Custom color for map marker pin</p>
              </div>
              
              {/* Save/Cancel Buttons - Right below coordinates */}
              <div className="flex justify-end gap-2 pt-4 border-t border-blue-200 dark:border-blue-800/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentData(originalData);
                    setOpen(false);
                  }}
                  className="bg-transparent border-transparent hover:bg-transparent hover:border-transparent text-red-600 hover:text-red-700"
                  style={{fontSize: '10px'}}
                  data-testid="button-cancel-info"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveClick}
                  disabled={isSaving || !hasChanges()}
                  className={hasChanges() ? 'bg-transparent border-transparent hover:bg-transparent hover:border-transparent text-green-600 hover:text-green-700' : 'bg-transparent border-transparent text-gray-400 cursor-not-allowed'}
                  style={{fontSize: '10px'}}
                  data-testid="button-save-info"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

        </div>
        <DialogFooter 
          className="pt-6 mt-2 border-t border-blue-900 dark:border-cyan-400/50 bg-blue-50/50 dark:bg-black/30 backdrop-blur-sm rounded-b-2xl -mx-6 -mb-6 px-6"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <div className="flex flex-col gap-4 w-full">
            {/* Action Buttons Row */}
            <div className="flex justify-between items-center w-full">
              <div className="flex gap-2 flex-wrap">
              {location !== "QL Kitchen" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditClick}
                  className="bg-transparent border-transparent hover:bg-transparent hover:border-transparent"
                  data-testid={`button-edit-${rowId}`}
                >
                  <ListChecks className="w-4 h-4 text-green-600" />
                </Button>
              )}
              {qrCode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleQrCodeClick}
                  disabled={isScanning}
                  className="bg-transparent border-transparent hover:bg-transparent hover:border-transparent"
                  data-testid={`button-qrcode-${rowId}`}
                >
                  <QrCode className="w-4 h-4 text-purple-600" />
                  {isScanning && <span className="ml-1 text-xs">Scanning...</span>}
                </Button>
              )}
              {(() => {
                const url = (() => {
                  if (!info) return "";
                  if (info.includes("|||URL|||")) {
                    return info.split("|||URL|||").pop() || "";
                  }
                  return "";
                })();
                
                return url.trim() ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUrlClick(url)}
                    className="bg-transparent border-transparent hover:bg-transparent hover:border-transparent"
                    data-testid={`button-open-url-${rowId}`}
                  >
                    <ExternalLink className="w-4 h-4 text-cyan-600" />
                  </Button>
                ) : null;
              })()}
              {latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude)) && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDirectionClick}
                    className="bg-transparent border-transparent hover:bg-transparent hover:border-transparent"
                    data-testid={`button-direction-${rowId}`}
                  >
                    <SiGooglemaps className="w-4 h-4 text-red-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleWazeClick}
                    className="bg-transparent border-transparent hover:bg-transparent hover:border-transparent"
                    data-testid={`button-waze-${rowId}`}
                  >
                    <SiWaze className="w-4 h-4 text-blue-500" />
                  </Button>
                </>
              )}
              </div>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
      
      {/* QR Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={handleCancelNavigation}>
        <DialogContent className="max-w-md animate-in zoom-in-95 duration-200 bg-gradient-to-br from-background/95 via-background/98 to-background dark:from-black/95 dark:via-black/98 dark:to-black border-2 border-blue-500/20 dark:border-blue-400/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <CheckCircle className="w-5 h-5" />
              QR Code Detected
            </DialogTitle>
            <DialogDescription>
              A QR code was scanned and contains a link.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50/50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Detected content:</p>
                  <div className="bg-background/50 dark:bg-black/50 p-2 rounded text-sm font-mono break-all">
                    {scannedResult}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Do you want to navigate to this link? It will open in a new tab.
            </p>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancelNavigation}
              data-testid="button-cancel-qr-navigation"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmNavigation}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-confirm-qr-navigation"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checklist Confirmation Dialog */}
      <Dialog open={showChecklistConfirm} onOpenChange={setShowChecklistConfirm}>
        <DialogContent className="max-w-md animate-in zoom-in-95 duration-200 bg-gradient-to-br from-background/95 via-background/98 to-background dark:from-black/95 dark:via-black/98 dark:to-black border-2 border-blue-500/20 dark:border-blue-400/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <ListChecks className="w-5 h-5" />
              Open Checklist
            </DialogTitle>
            <DialogDescription>
              Access the refill service checklist for this location.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50/50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">External Link:</p>
                  <div className="bg-background/50 dark:bg-black/50 p-2 rounded text-sm font-mono break-all">
                    https://fmvending.web.app/refill-service/M{formatCode(code)}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Do you want to open the refill service checklist? It will open in a new tab.
            </p>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowChecklistConfirm(false)}
              data-testid="button-cancel-checklist"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmEditClick}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-confirm-checklist"
            >
              <ListChecks className="w-4 h-4 mr-2" />
              Open Checklist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Navigation Confirmation Dialog */}
      <Dialog open={showNavigationConfirm} onOpenChange={setShowNavigationConfirm}>
        <DialogContent className="max-w-md animate-in zoom-in-95 duration-200 bg-gradient-to-br from-background/95 via-background/98 to-background dark:from-black/95 dark:via-black/98 dark:to-black border-2 border-blue-500/20 dark:border-blue-400/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              {navigationType === 'google' ? (
                <SiGooglemaps className="w-5 h-5" />
              ) : (
                <SiWaze className="w-5 h-5" />
              )}
              Open Navigation
            </DialogTitle>
            <DialogDescription>
              Navigate to this location using {navigationType === 'google' ? 'Google Maps' : 'Waze'}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50/50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Navigation to:</p>
                  <div className="bg-background/50 dark:bg-black/50 p-2 rounded text-sm">
                    {location || 'Location'} ({latitude}, {longitude})
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Using {navigationType === 'google' ? 'Google Maps' : 'Waze'}</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Do you want to open navigation to this location? It will open in a new tab.
            </p>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowNavigationConfirm(false)}
              data-testid="button-cancel-navigation"
            >
              Cancel
            </Button>
            <Button 
              onClick={navigationType === 'google' ? handleConfirmDirectionClick : handleConfirmWazeClick}
              className={navigationType === 'google' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
              data-testid="button-confirm-navigation"
            >
              {navigationType === 'google' ? (
                <SiGooglemaps className="w-4 h-4 mr-2" />
              ) : (
                <SiWaze className="w-4 h-4 mr-2" />
              )}
              Open {navigationType === 'google' ? 'Google Maps' : 'Waze'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* URL Confirmation Dialog */}
      <Dialog open={showUrlConfirm} onOpenChange={setShowUrlConfirm}>
        <DialogContent className="max-w-md animate-in zoom-in-95 duration-200 bg-gradient-to-br from-background/95 via-background/98 to-background dark:from-black/95 dark:via-black/98 dark:to-black border-2 border-blue-500/20 dark:border-blue-400/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <ExternalLink className="w-5 h-5" />
              Open External Link
            </DialogTitle>
            <DialogDescription>
              This will open a website in a new tab.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50/50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Website URL:</p>
                  <div className="bg-background/50 dark:bg-black/50 p-2 rounded text-sm font-mono break-all">
                    {urlToOpen}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Do you want to open this external link? It will open in a new tab and may use your data.
            </p>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowUrlConfirm(false)}
              data-testid="button-cancel-url"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmUrlOpen}
              className="bg-cyan-600 hover:bg-cyan-700"
              data-testid="button-confirm-url"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Dialog */}
      <Dialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
        <DialogContent className="max-w-md animate-in zoom-in-95 duration-200 bg-gradient-to-br from-background/95 via-background/98 to-background dark:from-black/95 dark:via-black/98 dark:to-black border-2 border-green-500/20 dark:border-green-400/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Save className="w-5 h-5" />
              Save Changes
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to save these changes to the location information?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-green-50/50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">Changes to be saved:</p>
                  <ul className="text-sm space-y-1">
                    {currentData.info !== originalData.info && (
                      <li className="text-green-700 dark:text-green-300">• Location details updated</li>
                    )}
                    {currentData.qrCode !== originalData.qrCode && (
                      <li className="text-green-700 dark:text-green-300">• QR code URL updated</li>
                    )}
                    {currentData.latitude !== originalData.latitude && (
                      <li className="text-green-700 dark:text-green-300">• Latitude updated</li>
                    )}
                    {currentData.longitude !== originalData.longitude && (
                      <li className="text-green-700 dark:text-green-300">• Longitude updated</li>
                    )}
                    {currentData.markerColor !== originalData.markerColor && (
                      <li className="text-green-700 dark:text-green-300">• Marker color updated</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowSaveConfirm(false)}
              data-testid="button-cancel-save"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmSave}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-confirm-save"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top-2 duration-300">
          <Alert className="bg-green-600 text-white border-green-700 shadow-lg">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <strong>Success!</strong> Information saved successfully.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </Dialog>
  );
}