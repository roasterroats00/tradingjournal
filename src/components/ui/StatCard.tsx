import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    description?: string;
    className?: string;
}

export function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    description,
    className,
}: StatCardProps) {
    return (
        <div
            className={cn(
                "glass rounded-xl p-6 relative overflow-hidden group transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]",
                className
            )}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon className="w-24 h-24 text-primary" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        {title}
                    </p>
                    <div className="p-2 rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 shadow-[0_0_10px_-3px_rgba(6,182,212,0.5)]">
                        <Icon className="w-5 h-5" />
                    </div>
                </div>

                <div className="flex items-end justify-between">
                    <div>
                        <h3 className="text-3xl font-bold text-foreground text-glow tracking-tight">
                            {value}
                        </h3>
                        {description && (
                            <p className="text-xs text-muted-foreground mt-1">{description}</p>
                        )}
                    </div>

                    {(trend || trendValue) && (
                        <div className={cn(
                            "flex items-center text-xs font-semibold px-2 py-1 rounded-full border backdrop-blur-sm",
                            trend === "up" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                            trend === "down" && "bg-rose-500/10 text-rose-400 border-rose-500/20",
                            trend === "neutral" && "bg-slate-500/10 text-slate-400 border-slate-500/20"
                        )}>
                            {trend === "up" && <ArrowUpRight className="w-3 h-3 mr-1" />}
                            {trend === "down" && <ArrowDownRight className="w-3 h-3 mr-1" />}
                            {trend === "neutral" && <Minus className="w-3 h-3 mr-1" />}
                            {trendValue}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
