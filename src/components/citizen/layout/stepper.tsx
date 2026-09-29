import { Check, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepDef {
  label: string;
  icon: LucideIcon;
}

export function Stepper({
  steps,
  currentStep,
  furthestStep,
  onStepClick,
}: {
  steps: StepDef[];
  currentStep: number;
  furthestStep: number;
  onStepClick: (step: number) => void;
}) {
  const progressPct = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="mb-7">
      {/* Progress track */}
      <div className="relative mb-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-600 to-accent-500 transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Numbered circles */}
      <div className="mb-5 flex items-start justify-between">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isDone = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          const isReachable = stepNum <= furthestStep;
          return (
            <button
              key={step.label}
              type="button"
              onClick={() => isReachable && onStepClick(stepNum)}
              disabled={!isReachable}
              className={cn(
                "flex flex-1 flex-col items-center gap-1.5",
                isReachable ? "cursor-pointer" : "cursor-not-allowed"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                  isDone
                    ? "border-primary-600 bg-primary-600 text-white"
                    : isActive
                    ? "border-primary-600 bg-white text-primary-600 shadow-glossy"
                    : "border-border bg-white text-muted-foreground"
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : stepNum}
              </div>
              <span
                className={cn(
                  "hidden text-center text-xs font-semibold sm:block",
                  isActive ? "text-primary-700" : isDone ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Icon tab row */}
      <div className="flex gap-1 rounded-xl bg-muted/70 p-1.5">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === currentStep;
          const isReachable = stepNum <= furthestStep;
          const Icon = step.icon;
          return (
            <button
              key={step.label}
              type="button"
              onClick={() => isReachable && onStepClick(stepNum)}
              disabled={!isReachable}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-semibold transition-all sm:text-sm",
                isActive
                  ? "bg-primary-600 text-white shadow-glossy"
                  : isReachable
                  ? "text-foreground hover:bg-white"
                  : "cursor-not-allowed text-muted-foreground/60"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="hidden xs:inline">{step.label}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Step {currentStep} of {steps.length}
      </p>
    </div>
  );
}
