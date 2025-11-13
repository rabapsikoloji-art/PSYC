
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Get client's active packages
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "CLIENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const client = await prisma.client.findUnique({
            where: { userId: session.user.id }
        });

        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        const clientPackages = await prisma.clientPackage.findMany({
            where: {
                clientId: client.id,
                isActive: true,
                expiryDate: {
                    gte: new Date()
                }
            },
            include: {
                package: {
                    include: {
                        packageServices: {
                            include: {
                                service: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                purchaseDate: 'desc'
            }
        });

        return NextResponse.json(clientPackages);
    } catch (error) {
        console.error("Get client packages error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
