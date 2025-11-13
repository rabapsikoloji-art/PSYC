
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      referralSource,
      tcNo,
      address,
      accountType,
      kvkkConsent,
      consentFormAccepted,
    } = body;

    // Validation
    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json(
        { error: "Tüm zorunlu alanları doldurunuz" },
        { status: 400 }
      );
    }

    if (!kvkkConsent || !consentFormAccepted) {
      return NextResponse.json(
        { error: "KVKK ve Onam formunu onaylamanız gerekmektedir" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email adresi zaten kayıtlı" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user and client
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        phone,
        referralSource,
        tcNo,
        address,
        accountType: accountType || "ADULT",
        kvkkConsent: true,
        consentFormType: accountType === "CHILD" ? "child" : "adult",
        role: "CLIENT",
        ethicsFormAccepted: false,
        client: {
          create: {
            firstName,
            lastName,
            phone,
            kvkk_consent: true,
            consentDate: new Date(),
          },
        },
      },
      include: {
        client: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Kayıt başarılı! Şimdi giriş yapabilirsiniz.",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Kayıt işlemi başarısız" },
      { status: 500 }
    );
  }
}
