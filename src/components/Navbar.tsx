"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LineChart, Settings, LogOut, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/trades", label: "Jurnal", icon: LineChart },
        { href: "/dashboard/settings", label: "Pengaturan", icon: Settings },
    ];

    return (
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4">
            <div className="glass rounded-full px-6 py-3 flex items-center justify-between shadow-2xl shadow-primary/5">
                <div className="flex items-center gap-2 mr-8">
                    <div className="bg-primary/20 p-2 rounded-full border border-primary/20">
                        <Activity className="w-5 h-5 text-primary animate-pulse" />
                    </div>
                    <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        TRADING<span className="text-primary">JOURNAL</span>
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                                    isActive
                                        ? "bg-primary/15 text-primary shadow-[0_0_15px_-5px_rgba(6,182,212,0.4)] border border-primary/20"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                <div className="ml-8 pl-8 border-l border-white/10">
                    <Link
                        href="/api/auth/signout"
                        className="flex items-center gap-2 text-sm font-medium text-rose-400 hover:text-rose-300 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Keluar
                    </Link>
                </div>
            </div>
        </nav>
    );
}
