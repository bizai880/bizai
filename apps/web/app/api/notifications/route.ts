import { type NextRequest, NextResponse } from "next/server";

// Simple notifications API without supabase dependency
export async function GET(_request: NextRequest) {
	return NextResponse.json({
		success: true,
		notifications: [
			{ id: 1, title: "Welcome", message: "Welcome to BizAI", read: false },
			{
				id: 2,
				title: "Update",
				message: "System updated successfully",
				read: true,
			},
		],
		count: 2,
		timestamp: new Date().toISOString(),
	});
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		return NextResponse.json({
			success: true,
			message: "Notification created",
			id: Date.now(),
			data: body,
			timestamp: new Date().toISOString(),
		});
	} catch (_error) {
		return NextResponse.json(
			{ success: false, error: "Invalid request" },
			{ status: 400 },
		);
	}
}
