import { Check } from "lucide-react";

import { KB_WORKFLOW, type KbWorkflowStatus } from "@/lib/kb-governance";

export function RuleWorkflow({ status }: { status: KbWorkflowStatus }) {
  const active = KB_WORKFLOW.indexOf(status);
  return <ol className="grid gap-2 sm:grid-cols-4">{KB_WORKFLOW.map((step, index) => <li key={step} className={`flex min-w-0 items-center gap-2 rounded-md border px-2 py-2 text-[10px] ${index <= active ? "border-primary/35 bg-primary/8 text-primary" : "border-border text-muted-foreground"}`}><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-current">{index < active ? <Check className="h-3 w-3"/> : index + 1}</span><span className="truncate">{step}</span></li>)}</ol>;
}