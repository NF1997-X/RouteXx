import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Database, Settings, Save, DoorOpen, Rows, Receipt, Layout, Sun, Moon, Bookmark, Plus, ChevronDown, Menu, BookOpen, LayoutGrid, ListChecks, Edit2, Table2, Link2, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { AddColumnModal } from "./add-column-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

interface NavigationProps {
  editMode?: boolean;
  onEditModeRequest?: () => void;
  onShowCustomization?: () => void;
  onAddRow?: () => void;
  onSaveData?: () => void;
  onGenerateTng?: () => void;
  onAddColumn?: (columnData: { name: string; dataKey: string; type: string; options?: string[] }) => Promise<void>;
  onOptimizeRoute?: () => void;
  onCalculateTolls?: () => void;
  onSaveLayout?: () => void;
  onSavedLinks?: () => void;
  onShowTutorial?: () => void;
  isAuthenticated?: boolean;
  theme?: string;
  onToggleTheme?: () => void;
}

export function Navigation({ editMode, onEditModeRequest, onShowCustomization, onAddRow, onSaveData, onGenerateTng, onAddColumn, onOptimizeRoute, onCalculateTolls, onSaveLayout, onSavedLinks, onShowTutorial, isAuthenticated, theme, onToggleTheme }: NavigationProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [, navigate] = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return date.toLocaleString('en-US', options);
  };

  return (
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
                  {editMode ? "Edit Mode" : "Route Management"}
                </span>
                <span className="text-slate-400 dark:text-slate-500 leading-none my-0.5" style={{ fontSize: '9px' }}>
                  All in one data informations
                </span>
              </div>
            </div>
          </div>

          {/* Navigation - Single Menu Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="btn-glass w-8 h-8 md:w-auto md:h-9 p-0 md:px-3 pagination-button group transition-all duration-300 ease-out hover:shadow-lg hover:shadow-blue-500/20 data-[state=open]:shadow-lg data-[state=open]:shadow-blue-500/30"
                data-testid="button-main-menu"
                title="Menu"
              >
                <LayoutGrid className="w-4 h-4 text-blue-600 dark:text-blue-400 transition-all duration-300" />
                <span className="hidden md:inline ml-2 text-xs transition-all duration-300">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 bg-white/70 dark:bg-black/70 backdrop-blur-2xl border-2 border-gray-200/60 dark:border-white/10 shadow-[0_20px_60px_0_rgba(0,0,0,0.25)] rounded-2xl"
            >
              {/* Edit Page Submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger
                  className="cursor-pointer"
                  data-testid="menu-edit-page"
                >
                  <Edit2 className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" />
                  <span style={{fontSize: '10px'}}>Vm Route</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent 
                    className="w-56 bg-white/70 dark:bg-black/70 backdrop-blur-2xl border-2 border-gray-200/60 dark:border-white/10 shadow-[0_20px_60px_0_rgba(0,0,0,0.25)] rounded-2xl telegram-submenu"
                    sideOffset={4}
                    collisionPadding={8}
                  >
                    <DropdownMenuItem 
                      onClick={() => navigate('/share/tzqe9a')}
                      className="cursor-pointer"
                      data-testid="submenu-share-example"
                    >
                      <Link2 className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
                      <span style={{fontSize: '10px'}}>Share Link Page (Example)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/custom/8m2v27')}
                      className="cursor-pointer"
                      data-testid="submenu-custom-example"
                    >
                      <Table2 className="w-4 h-4 mr-2 text-green-500 dark:text-green-400" />
                      <span style={{fontSize: '10px'}}>Custom Page (Example)</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
                    <DropdownMenuItem 
                      onClick={() => navigate('/custom-tables')}
                      className="cursor-pointer"
                      data-testid="submenu-custom-list"
                    >
                      <ListChecks className="w-4 h-4 mr-2 text-purple-500 dark:text-purple-400" />
                      <span style={{fontSize: '10px'}}>All Custom Tables</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={onSavedLinks}
                      className="cursor-pointer"
                      data-testid="submenu-saved-links"
                    >
                      <Bookmark className="w-4 h-4 mr-2 text-amber-500 dark:text-amber-400" />
                      <span style={{fontSize: '10px'}}>All Saved Links</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              {/* Theme Toggle */}
              <DropdownMenuItem 
                onClick={onToggleTheme}
                className="cursor-pointer"
                data-testid="menu-toggle-theme"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 mr-2 text-yellow-500" />
                    <span style={{fontSize: '10px'}}>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 mr-2 text-blue-500" />
                    <span style={{fontSize: '10px'}}>Dark Mode</span>
                  </>
                )}
              </DropdownMenuItem>

              {/* Help Guide */}
              <DropdownMenuItem 
                onClick={() => navigate('/help')}
                className="cursor-pointer"
                data-testid="menu-help-guide"
              >
                <BookOpen className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                <span style={{fontSize: '10px'}}>User Guide</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />

              {/* Edit Mode Options */}
              {editMode ? (
                <>
                  <DropdownMenuItem 
                    onClick={onAddRow}
                    className="cursor-pointer"
                    data-testid="menu-add-row"
                  >
                    <Rows className="w-4 h-4 mr-2" />
                    <span style={{fontSize: '10px'}}>Add Row</span>
                  </DropdownMenuItem>
                  {onAddColumn && (
                    <DropdownMenuItem 
                      onClick={() => {
                        // Trigger add column modal
                        const addColumnButton = document.querySelector('[data-testid="button-add-column"]') as HTMLButtonElement;
                        if (addColumnButton) addColumnButton.click();
                      }}
                      className="cursor-pointer"
                      data-testid="menu-add-column"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      <span style={{fontSize: '10px'}}>Add Column</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
                  <DropdownMenuItem 
                    onClick={onEditModeRequest}
                    className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                    data-testid="menu-exit-edit"
                  >
                    <DoorOpen className="w-4 h-4 mr-2" />
                    <span style={{fontSize: '10px'}}>Exit Edit Mode</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem 
                  onClick={onEditModeRequest}
                  className="cursor-pointer"
                  data-testid="menu-enter-edit"
                >
                  <Settings className="w-4 h-4 mr-2 text-red-900 dark:text-red-400" />
                  <span style={{fontSize: '10px'}}>Edit Mode</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Hidden Add Column Modal - triggered from dropdown */}
          {editMode && onAddColumn && (
            <div className="hidden">
              <AddColumnModal
                onCreateColumn={onAddColumn}
                disabled={!isAuthenticated}
              />
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}