import { NextResponse } from "next/server";
import type {
  WeddingDateRequest,
  WeddingDateResponse,
} from "@/lib/types/wedding-date";

function isValidPayload(payload: unknown): payload is WeddingDateRequest {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const candidate = payload as Partial<WeddingDateRequest>;
  return (
    typeof candidate.city === "string" &&
    typeof candidate.groomZodiac === "string" &&
    typeof candidate.brideZodiac === "string" &&
    typeof candidate.preferredTemperatureRange?.min === "number" &&
    typeof candidate.preferredTemperatureRange?.max === "number"
  );
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!isValidPayload(body)) {
    return NextResponse.json(
      {
        error:
          "Invalid payload. Please include city, zodiac signs, and temperature range.",
      },
      { status: 400 },
    );
  }

  const suggestedDate = new Date();
  suggestedDate.setDate(suggestedDate.getDate() + 90);

  const response: WeddingDateResponse = {
    message:
      "Structure is ready. Replace this placeholder logic with your AI model integration.",
    recommendation: {
      suggestedDate: suggestedDate.toISOString().slice(0, 10),
      rationale: `Sample recommendation for ${body.city} based on ${body.groomZodiac} and ${body.brideZodiac} with preferred ${body.preferredTemperatureRange.min}-${body.preferredTemperatureRange.max}°C.`,
    },
    receivedInput: body,
  };

  return NextResponse.json(response);
}
