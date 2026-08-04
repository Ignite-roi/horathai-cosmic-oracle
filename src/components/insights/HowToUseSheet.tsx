import { CircleHelp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function HowToUseSheet({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <CircleHelp className="h-4 w-4" /> วิธีใช้
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-lg rounded-t-[28px] border-border bg-background"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="thai-heading text-gold">{title}</SheetTitle>
          <SheetDescription asChild>
            <div className="space-y-3 pt-2 text-[13px] leading-7 text-muted-foreground">
              {children}
            </div>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
