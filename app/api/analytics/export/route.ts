import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const session = await getSession(req);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") ?? "csv";

    // Fetch click history
    const clicks = await prisma.click.findMany({
        where: {
            userId: session.user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    if (format === "csv") {
        // Generate CSV content
        let csvContent = "Timestamp,Platform Link,Referrer,Location,Device,Browser,OS\r\n";
        
        for (const click of clicks) {
            const timestamp = click.createdAt.toISOString();
            const url = click.url ? `"${click.url.replace(/"/g, '""')}"` : "";
            const referer = click.referer ? `"${click.referer.replace(/"/g, '""')}"` : "";
            const country = click.country ? `"${click.country.replace(/"/g, '""')}"` : "";
            const device = click.device ? `"${click.device.replace(/"/g, '""')}"` : "";
            const browser = click.browser ? `"${click.browser.replace(/"/g, '""')}"` : "";
            const os = click.os ? `"${click.os.replace(/"/g, '""')}"` : "";
            
            csvContent += `${timestamp},${url},${referer},${country},${device},${browser},${os}\r\n`;
        }

        return new NextResponse(csvContent, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="linkid_click_history_${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    }

    // Default to JSON format
    return NextResponse.json({ clicks });
}
