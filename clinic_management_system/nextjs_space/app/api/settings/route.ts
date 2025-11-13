
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { promises as fs } from 'fs';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

// Default settings
const DEFAULT_SETTINGS = {
  whatsappApiEnabled: false,
  whatsappApiKey: '',
  whatsappPhoneNumber: '',
  reminderEnabled: false,
  reminderHoursBefore: 24,
  clinicName: 'Raba Psikoloji',
  clinicAddress: '',
  clinicPhone: '',
  clinicEmail: '',
  iban: ''
};

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// GET - Fetch settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMINISTRATOR', 'COORDINATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    await ensureDataDir();

    try {
      const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
      const settings = JSON.parse(data);
      return NextResponse.json(settings);
    } catch {
      // If file doesn't exist, return default settings
      return NextResponse.json(DEFAULT_SETTINGS);
    }
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Ayarlar yüklenemedi" }, { status: 500 });
  }
}

// POST - Save settings
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMINISTRATOR', 'COORDINATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const settings = await request.json();

    await ensureDataDir();
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: "Ayarlar kaydedilemedi" }, { status: 500 });
  }
}
