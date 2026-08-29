import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone number and OTP are required" }, { status: 400 });
    }

    const apiKey = process.env.FAST2SMS_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "FAST2SMS_API_KEY missing in .env.local" }, { status: 500 });
    }

    // Fast2SMS Quick Transactional / OTP payload
    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        "authorization": apiKey.trim(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "q",
        message: `Your TROVELLA verification OTP is ${otp}. Do not share this code with anyone.`,
        language: "english",
        flash: 0,
        numbers: phone,
      }),
    });

    const result = await response.json();

    if (result.return === true || result.status_code === 200) {
      return NextResponse.json({ success: true, message: "OTP sent successfully" });
    } else {
      return NextResponse.json({ error: result.message || "Failed to send SMS" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}