import { cn } from "@/lib/utils";
import {
  adminPremiumCard,
  adminPremiumCardAccent,
  adminPremiumCardHeader,
  adminPremiumHeading,
  adminPremiumSub,
} from "@/lib/admin-premium-ui";

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
    <div className={cn(adminPremiumCard, className)}>
      <div className={adminPremiumCardAccent} aria-hidden />
      {(title || action) && (
        <div
          className={cn(
            adminPremiumCardHeader,
            "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
          )}
        >
          <div>
            {title && <h3 className={cn(adminPremiumHeading, "text-base sm:text-[1.0625rem]")}>{title}</h3>}
            {subtitle && <p className={adminPremiumSub}>{subtitle}</p>}
          </div>
          {action && <div className="mt-3 shrink-0 sm:mt-0">{action}</div>}
        </div>
      )}
      <div className="relative z-[2] p-6 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-200/95">
        {children}
      </div>
    </div>
  );
}
