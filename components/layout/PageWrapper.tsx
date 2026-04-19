import { cn } from "@/lib/utils";

interface PageWrapperProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function PageWrapper({
  title,
  subtitle,
  action,
  children,
  className,
}: PageWrapperProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-[#1e1b4b] shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>

      {/* Content */}
      <div className={cn("flex-1 overflow-y-auto px-8 py-6", className)}>
        {children}
      </div>
    </div>
  );
}