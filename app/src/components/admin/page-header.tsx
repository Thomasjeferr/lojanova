type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-950 dark:text-white sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-[15px] font-medium leading-relaxed tracking-tight text-zinc-600 dark:text-zinc-400 sm:mt-2">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="mt-4 shrink-0 sm:mt-0">{action}</div>
      )}
    </div>
  );
}
