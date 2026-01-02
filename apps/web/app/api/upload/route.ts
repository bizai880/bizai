import { type NextRequest, NextResponse } from "next/server";
import { storageUploader } from "@/lib/storage/uploader";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;

		if (!file) {
			return NextResponse.json(
				{ success: false, error: "No file provided" },
				{ status: 400 },
			);
		}

		const uploadResult = await storageUploader.uploadFile(file, file.name, {
			maxFileSize: 50 * 1024 * 1024, // 50MB
			allowedMimeTypes: [
				"image/*",
				"application/pdf",
				"text/plain",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			],
		});

		return NextResponse.json(uploadResult);
	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Upload failed",
			},
			{ status: 500 },
		);
	}
}

export async function GET(request: NextRequest) {
	return NextResponse.json({
		endpoint: "file-upload",
		maxFileSize: "50MB",
		allowedTypes: ["images", "pdf", "text", "excel"],
		methods: ["POST"],
	});
}
