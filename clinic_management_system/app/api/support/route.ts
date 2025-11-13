
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { subject, message, priority } = body;

        if (!subject || !message) {
            return NextResponse.json({ error: "Konu ve mesaj gereklidir" }, { status: 400 });
        }

        // Create notification for all administrators
        const admins = await prisma.user.findMany({
            where: {
                role: "ADMINISTRATOR"
            },
            select: {
                id: true
            }
        });

        // Create notifications for all admins
        await prisma.notification.createMany({
            data: admins.map(admin => ({
                userId: admin.id,
                title: `Destek Talebi: ${subject}`,
                message: `${session.user.name} (${session.user.email}) destek talebinde bulundu:\n\n${message}`,
                type: "general",
                isRead: false
            }))
        });

        return NextResponse.json({
            success: true,
            message: "Destek talebiniz iletildi. En kısa sürede size dönüş yapılacaktır."
        });
    } catch (error) {
        console.error("Support request error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
