export function GradientFooter() {
  return (
    <footer className="sticky bottom-0 z-40 w-full border-t-2 border-blue-500/50 dark:border-blue-400/50 bg-gradient-to-r from-blue-500/10 via-blue-600/10 to-blue-700/10 dark:from-blue-500/20 dark:via-blue-600/20 dark:to-blue-700/20 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg shadow-blue-500/20">
      <div className="container mx-auto px-4">
        <div className="flex h-12 items-center justify-between text-[10px]">
          <div className="flex items-center space-x-2">
            <span className="text-slate-600 dark:text-slate-400">
              © {new Date().getFullYear()} Route Management System
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 dark:text-slate-500">
              Powered by FamilyMart
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
