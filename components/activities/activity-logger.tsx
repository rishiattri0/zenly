"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ActivityLoggerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActivityLogged?: () => void;
}

export function ActivityLogger({
  open,
  onOpenChange,
  onActivityLogged,
}: ActivityLoggerProps) {
  const handleClose = () => {
    onActivityLogged?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Quick check-in</DialogTitle>
          <DialogDescription>
            Log a quick wellness activity or note how you&apos;re feeling.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-center text-muted-foreground text-sm">
          Check-in logging will be available soon.
        </div>
        <Button onClick={handleClose} className="w-full">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
