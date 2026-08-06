import { NextRequest, NextResponse } from "next/server";

// Self-contained contact endpoint for the demo. Validates input and
// acknowledges the message without depending on an external backend.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { detail: "Name, email and message are required." },
        { status: 400 }
      );
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email));
    if (!emailOk) {
      return NextResponse.json(
        { detail: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { detail: "Thanks for reaching out — we'll get back to you soon!" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { detail: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
