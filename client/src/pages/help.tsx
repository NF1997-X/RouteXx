import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, 
  Home, 
  Table2, 
  Edit3, 
  Route, 
  Map, 
  Image, 
  Truck, 
  Share2,
  Lightbulb,
  Play,
  Keyboard,
  AlertCircle,
  Database
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";

export default function HelpPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Fixed Header with Gradient Background */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b-2 border-blue-500/50 dark:border-blue-400/50 bg-gradient-to-r from-blue-500/10 via-blue-600/10 to-blue-700/10 dark:from-blue-500/20 dark:via-blue-600/20 dark:to-blue-700/20 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg shadow-blue-500/20">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between text-[12px]">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden">
                  <img 
                    src="/assets/Logofm.png" 
                    alt="Logo" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-0 leading-tight">
                  <span className="font-bold text-slate-600 dark:text-slate-300 leading-none" style={{ fontSize: '12px' }}>
                    User Guide
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 leading-none my-0.5" style={{ fontSize: '9px' }}>
                    Complete guide and documentation
                  </span>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2 h-9">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content with padding for fixed header */}
      <div className="pt-16 pb-0 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-white/70 dark:bg-slate-900/50 border-slate-300 dark:border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Welcome to the Route Management System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-200px)] pr-4">
              <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                
                <section>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    What is This App?
                  </h2>
                  <p className="text-sm">
                    This is a comprehensive delivery route management system designed to help you efficiently manage 
                    delivery location data. You can organize, edit, and optimize delivery routes with ease using an 
                    interactive drag-and-drop interface. The system is built to streamline your logistics operations 
                    and improve delivery efficiency.
                  </p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Key Features</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2 text-sm">
                        <Table2 className="h-4 w-4" />
                        1. Table Management
                      </h3>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                        <li>Add, edit, and delete location data rows</li>
                        <li>Drag-and-drop to reorder entries</li>
                        <li>Show/hide columns based on your needs</li>
                        <li>Search and filter to quickly find data</li>
                        <li>Real-time calculations and statistics</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2 text-sm">
                        <Edit3 className="h-4 w-4" />
                        2. Edit Mode
                      </h3>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                        <li>Click the menu button (☰) and select "Enter Edit Mode"</li>
                        <li>Add, modify, or delete data while in edit mode</li>
                        <li>Drag-and-drop to rearrange columns</li>
                        <li>Customize marker colors for map visualization</li>
                        <li>Click "Exit Edit Mode" when finished</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2 text-sm">
                        <Route className="h-4 w-4" />
                        3. Route Optimization
                      </h3>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                        <li>Click "Optimize Route" to calculate optimal delivery sequences</li>
                        <li>System automatically calculates distances and arranges the shortest routes</li>
                        <li>Supports Heavy Goods Vehicle (HGV/Lorry) routing profiles</li>
                        <li>View distances in kilometers from your base location (QL Kitchen)</li>
                        <li>Batch processing with intelligent rate limiting</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2 text-sm">
                        <Map className="h-4 w-4" />
                        4. Map View
                      </h3>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                        <li>Click the info icon (ⓘ) to view locations on the map</li>
                        <li>Marker colors can be customized in edit mode</li>
                        <li>Fullscreen map view for better visualization</li>
                        <li>Automatic route calculation from base location</li>
                        <li>Interactive markers with location details</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2 text-sm">
                        <Image className="h-4 w-4" />
                        5. Image Gallery
                      </h3>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                        <li>Upload images for each location</li>
                        <li>Support for multiple images per location</li>
                        <li>Lightbox view to see images in full size</li>
                        <li>Upload from your device or enter image URLs</li>
                        <li>Support for various image formats and large files</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2 text-sm">
                        <Truck className="h-4 w-4" />
                        6. Delivery Alternate System
                      </h3>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                        <li>4 delivery states: Normal, Alt 1, Alt 2, Inactive</li>
                        <li>Alt 1: Deliveries on Monday/Wednesday/Friday/Sunday</li>
                        <li>Alt 2: Deliveries on Tuesday/Thursday/Saturday</li>
                        <li>Automatic sorting based on current day</li>
                        <li>Color-coded visual indicators for each state</li>
                        <li>Off-schedule entries displayed with reduced brightness</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2 text-sm">
                        <Share2 className="h-4 w-4" />
                        7. Share Table
                      </h3>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                        <li>Click "Share Table" to generate a shareable link</li>
                        <li>Save links with custom names for easy reference</li>
                        <li>Share links with team members for view-only access</li>
                        <li>Access saved links from the menu</li>
                        <li>Shared tables maintain your current filters and column visibility</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    Usage Tips
                  </h2>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                    <li>
                      <span className="font-semibold">Default Columns:</span> By default, only 4 columns 
                      are displayed (No, Code, Location, Delivery). Use "Show/Hide Columns" to 
                      toggle additional columns.
                    </li>
                    <li>
                      <span className="font-semibold">Drag Handle:</span> Use the drag icon (⋮⋮) on the left 
                      side of each row to drag-and-drop and reorder entries.
                    </li>
                    <li>
                      <span className="font-semibold">Search:</span> Use the search box to quickly find data. 
                      Search works across all visible columns.
                    </li>
                    <li>
                      <span className="font-semibold">Filters:</span> Filter by Route or Delivery status 
                      using the dropdown filters for focused views.
                    </li>
                    <li>
                      <span className="font-semibold">Calculations:</span> The "Totals" row at the bottom 
                      automatically calculates sum/count based on visible data (after filters/search).
                    </li>
                    <li>
                      <span className="font-semibold">Inactive Rows:</span> Toggle the active/inactive state 
                      to temporarily hide locations. Inactive rows automatically sort to the bottom.
                    </li>
                    <li>
                      <span className="font-semibold">Header Content:</span> Slide left/right to view 
                      different header pages if multiple pages are configured.
                    </li>
                    <li>
                      <span className="font-semibold">Layout Preferences:</span> Your column visibility and order 
                      preferences are saved per user and persist across sessions.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                    <Play className="h-4 w-4 text-green-600 dark:text-green-400" />
                    Getting Started
                  </h2>
                  <ol className="list-decimal list-inside space-y-2 ml-4 text-sm">
                    <li>Browse the existing table data to familiarize yourself with the interface</li>
                    <li>Use search and filters to explore the data</li>
                    <li>Click the menu button (☰) to access additional options</li>
                    <li>Enter Edit Mode to make changes to the data</li>
                    <li>Try drag-and-drop to reorder rows and customize your view</li>
                    <li>Click the info icon (ⓘ) to view locations on the map</li>
                    <li>Use "Optimize Route" to calculate efficient delivery sequences</li>
                    <li>Exit Edit Mode when you're done making changes</li>
                  </ol>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                    <Keyboard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    Keyboard Shortcuts
                  </h2>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li><kbd className="px-2 py-1 text-xs bg-slate-800 rounded border border-slate-700">Esc</kbd> - Close modal/dialog windows</li>
                    <li><kbd className="px-2 py-1 text-xs bg-slate-800 rounded border border-slate-700">Enter</kbd> - Submit forms and confirm actions</li>
                  </ul>
                </section>

                <section className="bg-blue-500/10 dark:bg-blue-500/10 border border-blue-500/30 dark:border-blue-500/20 rounded-lg p-4">
                  <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Important Notes
                  </h2>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li><span className="font-semibold">Route Optimization:</span> Uses OpenRouteService API for commercial vehicle routing</li>
                    <li><span className="font-semibold">Toll Information:</span> Toll prices are not available and will display as 0</li>
                    <li><span className="font-semibold">Rate Limits:</span> Free tier allows 40 requests per minute, 2000 requests per day</li>
                    <li><span className="font-semibold">Batch Processing:</span> For routes with many locations, the system processes requests sequentially to respect rate limits</li>
                    <li><span className="font-semibold">Data Privacy:</span> Your layout preferences and settings are stored locally per user</li>
                  </ul>
                </section>

                <section className="bg-green-500/10 dark:bg-green-500/10 border border-green-500/30 dark:border-green-500/20 rounded-lg p-4">
                  <h2 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">Best Practices</h2>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Regularly save your work using the "Save Layout" option</li>
                    <li>Use descriptive names when saving share links for easy identification</li>
                    <li>Keep location coordinates accurate for optimal route calculations</li>
                    <li>Use the delivery alternate system to organize regular delivery schedules</li>
                    <li>Take advantage of filters to focus on specific routes or delivery types</li>
                  </ul>
                </section>

                <section>
                  <p className="text-center text-slate-600 dark:text-slate-400 italic mt-8 text-sm">
                    For technical support or questions, please contact your system administrator.
                  </p>
                  <p className="text-center text-slate-500 dark:text-slate-500 text-xs mt-4 mb-0">
                    Route Management System • Version 1.0.0
                  </p>
                </section>

              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
