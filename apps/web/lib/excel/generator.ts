// apps/web/lib/excel/generator.ts

// ⚠️ ملاحظة هامة لـ Next.js 15.5.9:
// - تجنب استخدام مكتبات تعتمد على Node.js في الكود الذي يعمل على المتصفح
// - استخدم dynamic imports للكود الذي يعمل فقط على الخادم

export interface ExcelColumn {
	name: string;
	type: "text" | "number" | "date" | "boolean" | "formula";
	formula?: string;
	validation?: {
		type: "list" | "date" | "number" | "textLength";
		values?: string[];
		min?: number;
		max?: number;
	};
	width?: number;
	format?: string;
}

export interface ExcelSheet {
	name: string;
	columns: ExcelColumn[];
	data: any[];
	charts?: Array<{
		type: "bar" | "line" | "pie" | "scatter";
		title: string;
		dataRange: string;
		categoriesRange?: string;
		position: { row: number; col: number };
	}>;
	filters?: string[];
	freezePane?: string;
}

export interface ExcelWorkbook {
	sheets: ExcelSheet[];
	metadata?: {
		author?: string;
		company?: string;
		created?: Date;
		description?: string;
	};
	styles?: {
		headerColor?: string;
		dataColor?: string;
		borderColor?: string;
	};
}

/**
 * مولد Excel للاستخدام على الخادم فقط
 * في Next.js 15.5.9، يجب فصل كود الخادم عن كود العميل
 */
export class ExcelGenerator {
	private async getExcelJS() {
		// استيراد ديناميكي لـ ExcelJS لتجنب مشاكل bundle size
		const ExcelJS = (await import("exceljs")).default;
		return ExcelJS;
	}

	async generate(config: ExcelWorkbook): Promise<Buffer> {
		try {
			const ExcelJS = await this.getExcelJS();
			const workbook = new ExcelJS.Workbook();

			// إعداد البيانات الوصفية
			workbook.creator = config.metadata?.author || "BizAI Factory";
			workbook.company = config.metadata?.company;
			workbook.created = config.metadata?.created || new Date();

			// إنشاء كل شيت
			config.sheets.forEach((sheetConfig, sheetIndex) => {
				const worksheet = workbook.addWorksheet(sheetConfig.name, {
					views: [{ state: "frozen", ySplit: 1 }],
				});

				// إضافة الأعمدة
				this.addColumns(worksheet, sheetConfig.columns);

				// إضافة البيانات
				this.addData(worksheet, sheetConfig.data, sheetConfig.columns);

				// ضبط أبعاد الأعمدة
				sheetConfig.columns.forEach((col, colIndex) => {
					const column = worksheet.getColumn(colIndex + 1);
					column.width = col.width || 15;
				});

				// حماية الشيت إذا لزم الأمر
				if (sheetIndex > 0) {
					worksheet.protect("bizai123", {
						selectLockedCells: false,
						selectUnlockedCells: true,
					});
				}
			});

			// إنشاء الشيت الملخص
			if (config.sheets.length > 1) {
				this.createSummarySheet(workbook, config);
			}

			// توليد الـ Buffer
			return await workbook.xlsx.writeBuffer();
		} catch (error) {
			console.error("Error generating Excel:", error);
			throw new Error("فشل في إنشاء ملف Excel");
		}
	}

	private addColumns(worksheet: any, columns: ExcelColumn[]) {
		// رؤوس الأعمدة
		const headerRow = worksheet.addRow(columns.map((col) => col.name));

		// تطبيق أنماط الرؤوس
		headerRow.eachCell((cell: any, _colNumber: number) => {
			cell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
			cell.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "FF4F81" },
			};
			cell.alignment = {
				vertical: "middle",
				horizontal: "center",
				wrapText: true,
			};
			cell.border = {
				top: { style: "thin", color: { argb: "FF000000" } },
				left: { style: "thin", color: { argb: "FF000000" } },
				bottom: { style: "thin", color: { argb: "FF000000" } },
				right: { style: "thin", color: { argb: "FF000000" } },
			};
		});
	}

	private addData(worksheet: any, data: any[], columns: ExcelColumn[]) {
		data.forEach((rowData, rowIndex) => {
			const row = worksheet.addRow(
				columns.map((col) => {
					const value =
						rowData[col.name] || rowData[col.name.toLowerCase()] || "";

					// تنسيق بناءً على نوع العمود
					switch (col.type) {
						case "date":
							return new Date(value);
						case "number":
							return Number(value) || 0;
						case "boolean":
							return value ? "نعم" : "لا";
						case "formula":
							return { formula: col.formula || "" };
						default:
							return value;
					}
				}),
			);

			// تطبيق أنماط الصفوف
			row.eachCell((cell: any, colNumber: number) => {
				const column = columns[colNumber - 1];

				cell.alignment = {
					vertical: "middle",
					horizontal: column.type === "number" ? "right" : "right",
					wrapText: true,
				};

				// تناوب ألوان الصفوف
				if (rowIndex % 2 === 0) {
					cell.fill = {
						type: "pattern",
						pattern: "solid",
						fgColor: { argb: "FFF5F5F5" },
					};
				}

				// تنسيقات خاصة
				if (column.type === "number") {
					cell.numFmt = "#,##0.00";
				} else if (column.type === "date") {
					cell.numFmt = "dd/mm/yyyy";
				}

				// حدود الخلايا
				cell.border = {
					top: { style: "thin", color: { argb: "FFDDDDDD" } },
					left: { style: "thin", color: { argb: "FFDDDDDD" } },
					bottom: { style: "thin", color: { argb: "FFDDDDDD" } },
					right: { style: "thin", color: { argb: "FFDDDDDD" } },
				};
			});
		});
	}

	private createSummarySheet(workbook: any, config: ExcelWorkbook) {
		const summarySheet = workbook.addWorksheet("ملخص النظام");

		summarySheet.addRow(["ملخص ملف Excel - تم الإنشاء بواسطة BizAI Factory"]);
		summarySheet.mergeCells("A1:D1");

		const titleCell = summarySheet.getCell("A1");
		titleCell.font = { bold: true, size: 16, color: { argb: "FF4F81" } };
		titleCell.alignment = { horizontal: "center" };

		summarySheet.addRow([""]);
		summarySheet.addRow(["معلومات الملف:", ""]);
		summarySheet.addRow(["تاريخ الإنشاء:", new Date().toLocaleString("ar-EG")]);
		summarySheet.addRow(["عدد الشيتات:", config.sheets.length]);
		summarySheet.addRow([
			"إجمالي الأعمدة:",
			config.sheets.reduce((acc, sheet) => acc + sheet.columns.length, 0),
		]);
		summarySheet.addRow([
			"إجمالي الصفوف:",
			config.sheets.reduce((acc, sheet) => acc + sheet.data.length, 0),
		]);
		summarySheet.addRow([""]);

		config.sheets.forEach((sheet, index) => {
			summarySheet.addRow([`الشيت ${index + 1}: ${sheet.name}`]);
			summarySheet.addRow(["اسم العمود", "النوع", "الصيغة"]);

			sheet.columns.forEach((col) => {
				summarySheet.addRow([col.name, col.type, col.formula || "-"]);
			});

			summarySheet.addRow([""]);
		});

		// تنسيق الشيت الملخص
		summarySheet.columns.forEach((column: any) => {
			column.width = 25;
		});
	}
}

/**
 * دالة لإنشاء Excel على العميل (يجب استخدامها مع caution)
 * في Next.js 15.5.9، يجب أن يكون هذا كود عميل فقط
 */
export async function generateExcelInBrowser(
	config: ExcelWorkbook,
	filename: string = "bizai-export.xlsx",
): Promise<void> {
	// ديناميك import للمكتبات المتعلقة بالعميل فقط
	const [ExcelJSModule, fileSaverModule] = await Promise.all([
		import("exceljs"),
		import("file-saver"),
	]);

	const ExcelJS = ExcelJSModule.default;
	const { saveAs } = fileSaverModule;

	try {
		const workbook = new ExcelJS.Workbook();
		workbook.creator = config.metadata?.author || "BizAI Factory";

		// إنشاء الورقة الأساسية
		const worksheet = workbook.addWorksheet(
			config.sheets[0]?.name || "البيانات",
		);

		// إضافة البيانات الأساسية فقط (بدون مميزات متقدمة)
		if (config.sheets[0]) {
			const sheet = config.sheets[0];

			// رؤوس الأعمدة
			worksheet.addRow(sheet.columns.map((col) => col.name));

			// البيانات
			sheet.data.forEach((rowData) => {
				worksheet.addRow(sheet.columns.map((col) => rowData[col.name] || ""));
			});
		}

		// توليد الملف
		const buffer = await workbook.xlsx.writeBuffer();
		const blob = new Blob([buffer], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});

		saveAs(blob, filename);
	} catch (error) {
		console.error("Error generating Excel in browser:", error);
		throw new Error("فشل في إنشاء ملف Excel");
	}
}

// دالة محسنة للقراءة في العميل
export async function readExcelFile(file: File): Promise<any> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = async (e) => {
			try {
				const buffer = e.target?.result as ArrayBuffer;

				// استيراد ديناميكي
				const ExcelJS = (await import("exceljs")).default;
				const workbook = new ExcelJS.Workbook();
				await workbook.xlsx.load(buffer);

				const sheetsData = workbook.worksheets.map((worksheet) => {
					const data: any[] = [];

					worksheet.eachRow((row, rowNumber) => {
						if (rowNumber === 1) return; // تخطي الرؤوس

						const rowData: any = {};
						row.eachCell((cell, colNumber) => {
							const header =
								worksheet.getRow(1).getCell(colNumber).value?.toString() ||
								`Column${colNumber}`;
							rowData[header] = cell.value;
						});

						data.push(rowData);
					});

					return {
						name: worksheet.name,
						rowCount: worksheet.rowCount,
						columnCount: worksheet.columnCount,
						data,
					};
				});

				resolve({
					fileName: file.name,
					fileSize: file.size,
					sheets: sheetsData,
				});
			} catch (error) {
				reject(error);
			}
		};

		reader.onerror = reject;
		reader.readAsArrayBuffer(file);
	});
}

// Export singleton instance (للاستخدام على الخادم فقط)
export const excelGenerator = new ExcelGenerator();
