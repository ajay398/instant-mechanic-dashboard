import {
  ArrowUpRight,
  ArrowDownRight,
  LucideIcon,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  positive?: boolean;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  change,
  positive = true,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>

        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
          <Icon size={21} />
        </div>
      </div>

      {change && (
        <div className="mt-4 flex items-center gap-1 text-xs font-medium">
          {positive ? (
            <ArrowUpRight
              size={15}
              className="text-emerald-600"
            />
          ) : (
            <ArrowDownRight
              size={15}
              className="text-red-500"
            />
          )}

          <span
            className={
              positive
                ? "text-emerald-600"
                : "text-red-500"
            }
          >
            {change}
          </span>

          <span className="text-slate-400">
            vs last period
          </span>
        </div>
      )}
    </div>
  );
}