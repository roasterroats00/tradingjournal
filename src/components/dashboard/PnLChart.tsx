"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

interface PnLChartProps {
    data: {
        name: string;
        pnl: number;
    }[];
}

export function PnLChart({ data }: PnLChartProps) {
    return (
        <div className="glass rounded-xl p-6 h-full flex flex-col">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">Grafik P&L Kumulatif</h3>
                <p className="text-sm text-muted-foreground">Pertumbuhan akun seiring waktu</p>
            </div>

            <div className="flex-1 w-full min-h-[250px]">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis
                                dataKey="name"
                                stroke="var(--muted-foreground)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="var(--muted-foreground)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "var(--popover)",
                                    borderColor: "var(--border)",
                                    color: "var(--foreground)",
                                    borderRadius: "0.5rem",
                                    boxShadow: "0 0 10px rgba(0,0,0,0.5)"
                                }}
                                itemStyle={{ color: "var(--primary)" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="pnl"
                                stroke="var(--primary)"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorPnL)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                        Belum ada data trade.
                    </div>
                )}
            </div>
        </div>
    );
}
