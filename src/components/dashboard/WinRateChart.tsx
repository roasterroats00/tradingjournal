"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface WinRateChartProps {
    wins: number;
    losses: number;
}

export function WinRateChart({ wins, losses }: WinRateChartProps) {
    const data = [
        { name: "Wins", value: wins, color: "var(--success)" },
        { name: "Losses", value: losses, color: "var(--destructive)" },
    ];

    // If no data, show empty state or just 0
    const hasData = wins > 0 || losses > 0;
    const total = wins + losses;
    const winRate = hasData ? Math.round((wins / total) * 100) : 0;

    return (
        <div className="glass rounded-xl p-6 h-full flex flex-col items-center justify-center relative">
            <div className="absolute top-6 left-6">
                <h3 className="text-lg font-semibold text-foreground">Win Rate</h3>
            </div>

            <div className="w-full h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={hasData ? data : [{ name: "No Data", value: 1, color: "var(--muted)" }]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={5}
                        >
                            {(hasData ? data : [{ name: "No Data", value: 1, color: "var(--muted)" }]).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "var(--popover)",
                                borderColor: "var(--border)",
                                borderRadius: "0.5rem"
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-foreground">{winRate}%</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-widest">
                        {total} Trades
                    </span>
                </div>
            </div>
        </div>
    );
}
