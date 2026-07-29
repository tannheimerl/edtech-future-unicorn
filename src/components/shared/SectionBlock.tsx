import { cn } from "@/lib/utils";

type SectionBlockProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export const SectionBlock = ({
  title,
  description,
  action,
  className,
  children,
}: SectionBlockProps) => {
  return (
    <div
      className={cn("rounded-2xl border border-border bg-card p-4", className)}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h5>{title}</h5>
          {description && (
            <p className="mt-2 text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
};
