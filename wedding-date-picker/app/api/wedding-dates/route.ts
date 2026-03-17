import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "婚礼择日 API 已就绪。",
    endpoints: ["/api/wedding-dates"],
  });
}
