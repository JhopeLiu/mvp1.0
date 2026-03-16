import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Wedding date picker API is ready.",
    endpoints: ["/api/wedding-dates"],
  });
}
