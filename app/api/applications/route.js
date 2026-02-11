import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "applications.json");

function readData() {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  return raw ? JSON.parse(raw) : [];
}

function writeData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export async function GET() {
  const applications = readData();
  return NextResponse.json(applications);
}

export async function POST(req) {
  const body = await req.json();

  if (!body?.name || !body?.email) {
    return NextResponse.json(
      { error: "Name and Email are required" },
      { status: 400 }
    );
  }

  const applications = readData();

  const newApp = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    name: body.name,
    email: body.email,
    instagram: body.instagram || "",
    niche: body.niche || "",
  };

  applications.unshift(newApp);
  writeData(applications);

  return NextResponse.json({ success: true, application: newApp });
}

export async function DELETE() {
  writeData([]);
  return NextResponse.json({ success: true });
}
