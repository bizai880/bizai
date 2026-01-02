// apps/web/app/api/excel/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { excelGenerator } from "@/lib/excel/generator";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// توليد ملف Excel
		const buffer = await excelGenerator.generate(body);

		// إرجاع الملف كاستجابة
		return new NextResponse(buffer, {
			headers: {
				"Content-Type":
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				"Content-Disposition": `attachment; filename="bizai-export.xlsx"`,
			},
		});
	} catch (error) {
		console.error("Excel generation error:", error);
		return NextResponse.json(
			{ error: "فشل في إنشاء ملف Excel" },
			{ status: 500 },
		);
	}
}
