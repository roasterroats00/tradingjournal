"use client";

import { useState } from "react";
import { getTradeAIAnalysis } from "@/lib/actions/ai";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface AITradeInsightProps {
    tradeId: string;
}

export function AITradeInsight({ tradeId }: AITradeInsightProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<{
        feedback: string;
        warnings: string[];
        suggestions: string[];
    } | null>(null);

    async function loadAnalysis() {
        if (analysis) {
            setIsOpen(!isOpen);
            return;
        }

        setLoading(true);
        setIsOpen(true);

        const result = await getTradeAIAnalysis(tradeId);

        if (result.success && result.analysis) {
            setAnalysis(result.analysis);
        }

        setLoading(false);
    }

    return (
        <div className="mt-2">
            <button
                onClick={loadAnalysis}
                className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors group"
            >
                <Sparkles className="w-3 h-3 group-hover:animate-pulse" />
                <span>AI Insight</span>
                {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {isOpen && (
                <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    {loading ? (
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Menganalisis trade...</span>
                        </div>
                    ) : analysis ? (
                        <>
                            <div className="text-xs text-foreground">
                                <p className="font-medium text-primary mb-1">💡 Feedback:</p>
                                <p className="text-muted-foreground">{analysis.feedback}</p>
                            </div>

                            {analysis.warnings.length > 0 && (
                                <div className="text-xs">
                                    <p className="font-medium text-yellow-400 mb-1">⚠️ Peringatan:</p>
                                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                        {analysis.warnings.map((warning, i) => (
                                            <li key={i}>{warning}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {analysis.suggestions.length > 0 && (
                                <div className="text-xs">
                                    <p className="font-medium text-emerald-400 mb-1">✅ Saran:</p>
                                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                        {analysis.suggestions.map((suggestion, i) => (
                                            <li key={i}>{suggestion}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-xs text-muted-foreground">Gagal memuat analisis.</p>
                    )}
                </div>
            )}
        </div>
    );
}
