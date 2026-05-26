"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, ChevronDown } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AnalyticsSummary = {
    rangeDays: number;
    totals: {
        totalClicks: number;
        uniqueClicks: number;
        botClicks: number;
    };
};

export function AnalyticsOverview() {
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function loadSummary() {
            try {
                const response = await fetch("/api/analytics/summary?days=30");
                if (!response.ok) return;

                const payload = (await response.json()) as { summary?: AnalyticsSummary };
                if (!cancelled && payload.summary) {
                    setSummary(payload.summary);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadSummary();

        return () => {
            cancelled = true;
        };
    }, []);

    const cards = useMemo(() => {
        if (!summary) {
            return [
                { label: "Total Clicks", value: 0 },
                { label: "Unique Visitors", value: 0 },
                { label: "Filtered Bot Hits", value: 0 },
            ];
        }

        return [
            { label: "Total Clicks", value: summary.totals.totalClicks },
            { label: "Unique Visitors", value: summary.totals.uniqueClicks },
            { label: "Filtered Bot Hits", value: summary.totals.botClicks },
        ];
    }, [summary]);

    const exportToCSV = () => {
        const link = document.createElement("a");
        link.setAttribute("href", "/api/analytics/export?format=csv");
        link.setAttribute("download", `linkid_click_history_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = () => {
        if (!summary) return;
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const html = `
            <html>
                <head>
                    <title>LinkID Analytics Report</title>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; padding: 40px; background: #fff; }
                        .header-container { border-bottom: 2px solid #4f46e5; padding-bottom: 15px; margin-bottom: 30px; }
                        h1 { font-size: 24px; margin: 0; color: #4f46e5; }
                        .subtitle { color: #64748b; font-size: 14px; margin-top: 5px; }
                        .card { border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 15px; }
                        .label { font-size: 14px; color: #64748b; font-weight: 500; }
                        .value { font-size: 28px; font-weight: bold; margin-top: 5px; color: #0f172a; }
                    </style>
                </head>
                <body>
                    <div class="header-container">
                        <h1>LinkID Analytics Report</h1>
                        <div class="subtitle">Generated on ${new Date().toLocaleDateString()} (Last ${summary.rangeDays} Days)</div>
                    </div>
                    <div class="card">
                        <div class="label">Total Clicks</div>
                        <div class="value">${summary.totals.totalClicks.toLocaleString()}</div>
                    </div>
                    <div class="card">
                        <div class="label">Unique Visitors</div>
                        <div class="value">${summary.totals.uniqueClicks.toLocaleString()}</div>
                    </div>
                    <div class="card">
                        <div class="label">Filtered Bot Hits</div>
                        <div class="value">${summary.totals.botClicks.toLocaleString()}</div>
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    return (
        <section className="space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-lg font-semibold">Analytics (last 30 days)</h2>
                    <p className="text-sm text-muted-foreground">
                        Bot traffic is filtered from totals and unique visitor counts.
                    </p>
                </div>
                {summary && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Download className="h-4 w-4" />
                                Export
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[140px]">
                            <DropdownMenuItem onClick={exportToCSV}>
                                Export CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={exportToPDF}>
                                Export PDF
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {cards.map((card) => (
                    <Card key={card.label}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {card.label}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">
                                {loading ? "..." : card.value.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}
