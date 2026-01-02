import { NextRequest, NextResponse } from "next/server";

// أبسط API route ممكن
export async function GET() {
	return NextResponse.json({
		status: "ok",
		message: "API is working",
		timestamp: new Date().toISOString(),
	});
}

export async function POST(request: NextRequest) {
	return NextResponse.json({
		success: true,
		message: "Request received",
		timestamp: new Date().toISOString(),
	});
}
