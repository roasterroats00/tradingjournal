"use client";

import { useEffect, useState } from "react";
import { checkTradingPatterns } from "@/lib/actions/ai";
import { AlertTriangle, TrendingDown, Zap } from "lucide-react";

export function AIPatternWarning() {
    const [warning, setWarning] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkPatterns() {
            const result = await checkTradingPatterns();

            if (result.success && result.patterns) {
                if (result.patterns.message) {
                    setWarning(result.patterns.message);
                }
            }

            setLoading(false);
        }

        checkPatterns();
    }, []);

    if (loading || !warning) {
        return null;
    }

    const getIcon = () => {
        if (warning.includes("revenge")) return <TrendingDown className="w-5 h-5" />;
        if (warning.includes("Overtrading")) return <Zap className="w-5 h-5" />;
        return <AlertTriangle className="w-5 h-5" />;
    };

    return (
        <div className="bg-yellow-950/30 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-4 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
                {getIcon()}
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-yellow-400 flex items-center gap-2">
                    🤖 AI Pattern Detection
                </h3>
                <p className="text-sm text-yellow-300/80 mt-1">{warning}</p>
            </div>
        </div>
    );
}
