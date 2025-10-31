import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface EditQuickLinksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditQuickLinksDialog({ open, onOpenChange }: EditQuickLinksDialogProps) {
  const [shareUrl, setShareUrl] = useState("/share/ko58de");
  const [customUrl, setCustomUrl] = useState("/custom/8kqk7x");
  const { toast } = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    if (open) {
      const savedShareUrl = localStorage.getItem("quickLink_share") || "/share/ko58de";
      const savedCustomUrl = localStorage.getItem("quickLink_custom") || "/custom/8kqk7x";
      setShareUrl(savedShareUrl);
      setCustomUrl(savedCustomUrl);
    }
  }, [open]);

  const handleSave = () => {
    // Validate URLs - trim and check not empty
    const trimmedShareUrl = shareUrl.trim();
    const trimmedCustomUrl = customUrl.trim();
    
    if (!trimmedShareUrl || !trimmedCustomUrl) {
      toast({
        title: "Validation error",
        description: "URLs cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    
    // Save to localStorage
    localStorage.setItem("quickLink_share", trimmedShareUrl);
    localStorage.setItem("quickLink_custom", trimmedCustomUrl);
    
    toast({
      title: "Quick links saved",
      description: "Your custom URLs have been updated.",
    });
    
    // Trigger a custom event to notify navigation component
    window.dispatchEvent(new CustomEvent("quickLinksUpdated"));
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] animate-in zoom-in-95 duration-300 data-[state=closed]:animate-out data-[state=closed]:zoom-out-90 bg-white/70 dark:bg-black/30 backdrop-blur-2xl border-2 border-gray-200/60 dark:border-white/10 shadow-[0_20px_60px_0_rgba(0,0,0,0.25)] rounded-3xl">
        {/* Enhanced Premium Frosted Glass Layer */}
        <div 
          className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-white/70 via-white/50 to-white/60 dark:from-black/50 dark:via-black/30 dark:to-black/40 border-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-1px_1px_rgba(0,0,0,0.1)]" 
          style={{
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          }}
        >
          {/* Subtle top shine effect */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent" />
          {/* Ambient glow */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5 dark:from-blue-400/10 dark:via-transparent dark:to-purple-400/10" />
        </div>
        
        <DialogHeader>
          <DialogTitle>Edit Quick Links</DialogTitle>
          <DialogDescription>
            Customize the URLs for your quick access links in the menu.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Share Link URL */}
          <div className="space-y-2">
            <Label htmlFor="shareUrl" className="text-sm font-medium">
              Share Link Page URL
            </Label>
            <Input
              id="shareUrl"
              value={shareUrl}
              onChange={(e) => setShareUrl(e.target.value)}
              placeholder="/share/ko58de"
              className="h-9"
            />
            <p className="text-xs text-muted-foreground">
              Example: /share/abc123 or https://example.com/share/xyz
            </p>
          </div>

          {/* Custom Page URL */}
          <div className="space-y-2">
            <Label htmlFor="customUrl" className="text-sm font-medium">
              Custom Page URL
            </Label>
            <Input
              id="customUrl"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="/custom/8kqk7x"
              className="h-9"
            />
            <p className="text-xs text-muted-foreground">
              Example: /custom/def456 or https://example.com/custom/abc
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
