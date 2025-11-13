
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = session.user.role;

        // Check permissions - CLIENT can also view personnel for booking appointments
        if (!["ADMINISTRATOR", "COORDINATOR", "PSYCHOLOGIST", "CLIENT"].includes(userRole)) {
            return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
        }

        const personnel = await prisma.personnel.findMany({
            where: {
                isActive: true,
                user: {
                    role: {
                        in: ["PSYCHOLOGIST"]
                    }
                }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                specialization: true,
                phone: userRole !== "CLIENT" ? true : false, // Don't show phone to clients
                photo: true,
                createdAt: true,
                user: {
                    select: {
                        role: true,
                        email: userRole !== "CLIENT" ? true : false // Don't show email to clients
                    }
                },
                services: {
                    include: {
                        service: true
                    }
                }
            },
            orderBy: {
                firstName: 'asc'
            }
        });

        return NextResponse.json(personnel);
    } catch (error) {
        console.error("Get personnel error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Sadece admin personel ekleyebilir
        if (session.user.role !== "ADMINISTRATOR" && session.user.role !== "COORDINATOR") {
            return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
        }

        const body = await req.json();
        const { firstName, lastName, email, password, phone, specialization, role, serviceIds } = body;

        // Email kontrolü
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "Bu email adresi zaten kullanılıyor" }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // User ve Personnel oluştur
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: `${firstName} ${lastName}`,
                role: role || "PSYCHOLOGIST",
                ethicsFormAccepted: true,
                ethicsFormAcceptedAt: new Date(),
                personnel: {
                    create: {
                        firstName,
                        lastName,
                        phone,
                        specialization
                    }
                }
            },
            include: {
                personnel: true
            }
        });

        // Hizmetleri bağla
        if (serviceIds && serviceIds.length > 0 && user.personnel) {
            await prisma.personnelService.createMany({
                data: serviceIds.map((serviceId: string) => ({
                    personnelId: user.personnel!.id,
                    serviceId
                }))
            });
        }

        return NextResponse.json({ success: true, personnel: user.personnel });
    } catch (error) {
        console.error("Create personnel error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
