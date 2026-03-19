import { cn } from "@/lib/utils";

type SectionCardProps = {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className,
}: SectionCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm",
        className,
      )}
    >
      {(title || action) && (
        <div className="flex flex-col gap-1 border-b border-zinc-100 bg-zinc-50/50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && (
              <h3 className="text-base font-semibold tracking-tight text-zinc-900">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
            )}
          </div>
          {action && (
            <div className="mt-3 shrink-0 sm:mt-0">{action}</div>
          )}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
