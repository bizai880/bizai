import * as XLSX from "xlsx";
import type { SalesRecord } from "./types";

export async function parseExcelFile(
	filePathOrData: string,
	sheetName: string = "Sales Tracker",
): Promise<SalesRecord[]> {
	try {
		// تحميل ملف Excel
		let workbook: XLSX.WorkBook;

		if (filePathOrData.startsWith("data:")) {
			// بيانات base64
			const base64Data = filePathOrData.split(",")[1];
			const buffer = Buffer.from(base64Data, "base64");
			workbook = XLSX.read(buffer, { type: "buffer" });
		} else if (filePathOrData.startsWith("http")) {
			// رابط URL
			const response = await fetch(filePathOrData);
			const buffer = await response.arrayBuffer();
			workbook = XLSX.read(buffer, { type: "array" });
		} else {
			// مسار ملف محلي
			workbook = XLSX.readFile(filePathOrData);
		}

		// الحصول على الورقة المطلوبة
		const worksheet = workbook.Sheets[sheetName];
		if (!worksheet) {
			throw new Error(`Sheet "${sheetName}" not found in Excel file`);
		}

		// تحويل إلى JSON
		const data = XLSX.utils.sheet_to_json(worksheet);

		// تحويل البيانات إلى SalesRecord
		const records: SalesRecord[] = data.map((row: unknown, _index: number) => {
			// البحث عن الأعمدة بأسماء مختلفة
			const findColumn = (possibleNames: string[]): unknown => {
				for (const name of possibleNames) {
					if (row[name] !== undefined) return row[name];
				}
				return null;
			};

			return {
				customerName: findColumn([
					"Customer Name",
					"اسم العميل",
					"العميل",
					"Customer",
				]),
				rfqNumber: findColumn(["RFQ Number", "رقم RFQ", "RFQ", "رقم الطلب"]),
				quotationStatus: findColumn([
					"Quotation Status",
					"حالة العرض",
					"حالة الاقتباس",
				]),
				deliveryStatus: findColumn([
					"Delivery Status",
					"حالة التسليم",
					"الحالة",
				]),
				expectedDeliveryDate: parseDate(
					findColumn([
						"Expected Delivery Date",
						"موعد التسليم المتوقع",
						"تاريخ التسليم",
					]),
				),
				priority: mapPriority(findColumn(["Priority", "الأولوية", "الأهمية"])),
				escalationFlag: mapEscalationFlag(
					findColumn(["Escalation Flag", "علم التصعيد", "تصعيد"]),
				),
				responsiblePerson: findColumn([
					"Responsible Person",
					"الشخص المسؤول",
					"المسؤول",
				]),
				lastFollowUpDate: parseDate(
					findColumn(["Last Follow-Up Date", "تاريخ آخر متابعة", "آخر متابعة"]),
				),
				orderNumber: findColumn([
					"Order Number",
					"رقم الأمر",
					"رقم الطلب النهائي",
				]),
				escalationReason: findColumn(["Escalation Reason", "سبب التصعيد"]),
				currentStatus: findColumn(["Current Status", "الحالة الحالية"]),
				recommendedAction: findColumn([
					"Recommended Action",
					"الإجراء المقترح",
				]),
			};
		});

		// تصفية السجلات الفارغة
		return records.filter((record) => record.customerName && record.rfqNumber);
	} catch (error: unknown) {
		console.error("Error parsing Excel file:", error);
		throw new Error(`Failed to parse Excel file: ${error.message}`);
	}
}

function parseDate(dateValue: unknown): Date | null {
	if (!dateValue) return null;

	try {
		if (dateValue instanceof Date) {
			return dateValue;
		}

		if (typeof dateValue === "number") {
			// Excel serial date
			return XLSX.SSF.parse_date_code(dateValue);
		}

		if (typeof dateValue === "string") {
			// تحويل التاريخ من نص
			const parsedDate = new Date(dateValue);
			if (!Number.isNaN(parsedDate.getTime())) {
				return parsedDate;
			}

			// محاولة تحليل التاريخ العربي
			const arabicDate = dateValue
				.replace(/ص/g, "AM")
				.replace(/م/g, "PM")
				.replace(/،/g, ",");

			const arabicParsed = new Date(arabicDate);
			if (!Number.isNaN(arabicParsed.getTime())) {
				return arabicParsed;
			}
		}

		return null;
	} catch {
		return null;
	}
}

function mapPriority(
	priorityValue: unknown,
): "Low" | "Medium" | "High" | "Critical" {
	if (!priorityValue) return "Medium";

	const value = priorityValue.toString().toLowerCase();

	if (
		value.includes("critical") ||
		value.includes("حرج") ||
		value.includes("أقصى")
	) {
		return "Critical";
	}

	if (
		value.includes("high") ||
		value.includes("عالي") ||
		value.includes("مرتفع")
	) {
		return "High";
	}

	if (
		value.includes("low") ||
		value.includes("منخفض") ||
		value.includes("واطي")
	) {
		return "Low";
	}

	return "Medium";
}

function mapEscalationFlag(flagValue: unknown): "Yes" | "No" {
	if (!flagValue) return "No";

	const value = flagValue.toString().toLowerCase();

	if (
		value === "yes" ||
		value === "y" ||
		value === "true" ||
		value === "1" ||
		value.includes("نعم") ||
		value.includes("صح")
	) {
		return "Yes";
	}

	return "No";
}

// دالة مساعدة لإنشاء ملف Excel تجريبي
export function createSampleExcelFile(): Buffer {
	const sampleData = [
		{
			"Customer Name": "شركة التقنية المتقدمة",
			"RFQ Number": "RFQ-2024-001",
			"Quotation Status": "Under Review",
			"Delivery Status": "Pending",
			"Expected Delivery Date": "2024-03-15",
			Priority: "High",
			"Escalation Flag": "No",
			"Responsible Person": "أحمد محمد",
			"Last Follow-Up Date": "2024-02-01",
			"Order Number": "ORD-2024-001",
		},
		{
			"Customer Name": "مؤسسة النجاح التجارية",
			"RFQ Number": "RFQ-2024-002",
			"Quotation Status": "Approved",
			"Delivery Status": "Delayed",
			"Expected Delivery Date": "2024-02-01",
			Priority: "Critical",
			"Escalation Flag": "Yes",
			"Responsible Person": "سارة علي",
			"Last Follow-Up Date": "2024-02-10",
			"Order Number": "ORD-2024-002",
			"Escalation Reason": "تأخير شديد في التسليم",
		},
		{
			"Customer Name": "شركة المستقبل الرقمي",
			"RFQ Number": "RFQ-2024-003",
			"Quotation Status": "Sent",
			"Delivery Status": "In Progress",
			"Expected Delivery Date": "2024-03-01",
			Priority: "Medium",
			"Escalation Flag": "No",
			"Responsible Person": "خالد حسن",
			"Last Follow-Up Date": "2024-02-25",
			"Order Number": "ORD-2024-003",
		},
	];

	const worksheet = XLSX.utils.json_to_sheet(sampleData);
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Tracker");

	return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}
