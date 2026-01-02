import type { SalesRecord } from "./types";

export function generateFollowUpEmail(record: SalesRecord): string {
	return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تذكير المتابعة</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background-color: #0078D4; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: white; padding: 30px; border-radius: 0 0 5px 5px; }
            .details { margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-right: 4px solid #0078D4; }
            .detail-row { display: flex; margin-bottom: 10px; }
            .detail-label { font-weight: bold; width: 150px; color: #555; }
            .detail-value { flex: 1; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
            .action-button { display: inline-block; background-color: #0078D4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔔 تذكير متابعة عميل</h1>
            </div>
            <div class="content">
                <p>عزيزي/عزيزتي <strong>${record.responsiblePerson}</strong>,</p>
                
                <p>هذا تذكير لمتابعة طلب العميل التالي الذي تجاوز 3 أيام عمل منذ آخر متابعة:</p>
                
                <div class="details">
                    <div class="detail-row">
                        <div class="detail-label">اسم العميل:</div>
                        <div class="detail-value">${record.customerName}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">رقم RFQ:</div>
                        <div class="detail-value">${record.rfqNumber}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">حالة العرض:</div>
                        <div class="detail-value">${record.quotationStatus}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">آخر متابعة:</div>
                        <div class="detail-value">${new Date(record.lastFollowUpDate).toLocaleDateString("ar-SA")}</div>
                    </div>
                </div>
                
                <p>يرجى التواصل مع العميل في أقرب وقت ممكن للحفاظ على العلاقة وتجنب فقدان الفرصة.</p>
                
                <p>مع خالص التقدير،<br>
                نظام أتمتة المبيعات</p>
            </div>
            <div class="footer">
                <p>هذه رسالة آلية، يرجى عدم الرد على هذا البريد الإلكتروني</p>
                <p>© ${new Date().getFullYear()} نظام إدارة المبيعات</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

export function generateDeliveryAlertEmail(record: SalesRecord): string {
	return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>إنذار تأخير التسليم</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background-color: #D83B01; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: white; padding: 30px; border-radius: 0 0 5px 5px; }
            .urgent { background-color: #FFF4CE; border: 2px solid #FFB900; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .details { margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-right: 4px solid #D83B01; }
            .detail-row { display: flex; margin-bottom: 10px; }
            .detail-label { font-weight: bold; width: 180px; color: #555; }
            .detail-value { flex: 1; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⚠️ إنذار تأخير التسليم</h1>
            </div>
            <div class="content">
                <div class="urgent">
                    <h3>تنبيه عاجل!</h3>
                    <p>طلب العميل التالي قد تجاوز موعد التسليم المتوقع ويتطلب تدخلاً عاجلاً:</p>
                </div>
                
                <div class="details">
                    <div class="detail-row">
                        <div class="detail-label">اسم العميل:</div>
                        <div class="detail-value">${record.customerName}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">رقم الطلب:</div>
                        <div class="detail-value">${record.orderNumber || record.rfqNumber}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">موعد التسليم المتوقع:</div>
                        <div class="detail-value">${new Date(record.expectedDeliveryDate).toLocaleDateString("ar-SA")}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">حالة التسليم الحالية:</div>
                        <div class="detail-value">${record.deliveryStatus}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">عدد أيام التأخير:</div>
                        <div class="detail-value">
                            ${Math.floor((new Date().getTime() - new Date(record.expectedDeliveryDate).getTime()) / (1000 * 60 * 60 * 24))} يوم
                        </div>
                    </div>
                </div>
                
                <h3>الإجراءات المطلوبة:</h3>
                <ol>
                    <li>التواصل مع العميل وإبلاغه بالموقف</li>
                    <li>تحديد سبب التأخير مع فريق الإنتاج</li>
                    <li>اقتراح موعد تسليم جديد</li>
                    <li>متابعة الحالة يومياً حتى التسليم</li>
                </ol>
                
                <p><strong>المسؤولون:</strong> إدارة المبيعات، مهندس المبيعات، المدير</p>
                
                <p>مع خالص التقدير،<br>
                نظام أتمتة المبيعات</p>
            </div>
            <div class="footer">
                <p>هذه رسالة آلية، يرجى عدم الرد على هذا البريد الإلكتروني</p>
                <p>© ${new Date().getFullYear()} نظام إدارة المبيعات</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

export function generatePriorityAlertEmail(record: SalesRecord): string {
	const priorityColor = record.priority === "Critical" ? "#D83B01" : "#FFB900";

	return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>إنذار طلب عالي الأولوية</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background-color: ${priorityColor}; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: white; padding: 30px; border-radius: 0 0 5px 5px; }
            .priority-badge { 
                display: inline-block; 
                background-color: ${priorityColor}; 
                color: white; 
                padding: 5px 15px; 
                border-radius: 20px; 
                font-weight: bold; 
                margin: 10px 0; 
            }
            .details { margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-right: 4px solid ${priorityColor}; }
            .detail-row { display: flex; margin-bottom: 10px; }
            .detail-label { font-weight: bold; width: 150px; color: #555; }
            .detail-value { flex: 1; }
            .action-items { background-color: #E7F3FF; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚨 طلب ${record.priority === "Critical" ? "حرج" : "عالي الأولوية"}</h1>
            </div>
            <div class="content">
                <div class="priority-badge">
                    ${record.priority === "Critical" ? "🔴 حرج" : "🟡 عالي الأولوية"}
                </div>
                
                <p>يتطلب الطلب التالي اهتماماً فورياً من فريق المبيعات:</p>
                
                <div class="details">
                    <div class="detail-row">
                        <div class="detail-label">اسم العميل:</div>
                        <div class="detail-value">${record.customerName}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">رقم RFQ:</div>
                        <div class="detail-value">${record.rfqNumber}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">حالة العرض:</div>
                        <div class="detail-value">${record.quotationStatus}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">حالة التسليم:</div>
                        <div class="detail-value">${record.deliveryStatus}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">موعد التسليم:</div>
                        <div class="detail-value">${new Date(record.expectedDeliveryDate).toLocaleDateString("ar-SA")}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">الشخص المسؤول:</div>
                        <div class="detail-value">${record.responsiblePerson}</div>
                    </div>
                </div>
                
                <div class="action-items">
                    <h3>الإجراءات العاجلة المطلوبة:</h3>
                    <ul>
                        <li>متابعة فورية مع العميل</li>
                        <li>تحديث حالة الطلب أولاً بأول</li>
                        <li>تنسيق مع فريق الإنتاج للتعجيل</li>
                        <li>رفع تقرير يومي عن التقدم</li>
                    </ul>
                </div>
                
                <p><strong>يتم إرسال هذه الرسالة إلى:</strong> فريق المبيعات بأكمله</p>
                
                <p>مع خالص التقدير،<br>
                نظام أتمتة المبيعات</p>
            </div>
            <div class="footer">
                <p>هذه رسالة آلية، يرجى عدم الرد على هذا البريد الإلكتروني</p>
                <p>© ${new Date().getFullYear()} نظام إدارة المبيعات</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

export function generateEscalationEmail(record: SalesRecord): string {
	return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تصعيد حالة عميل</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background-color: #7719AA; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: white; padding: 30px; border-radius: 0 0 5px 5px; }
            .escalation-box { 
                background-color: #F3E5F5; 
                border: 2px solid #7719AA; 
                padding: 20px; 
                margin: 20px 0; 
                border-radius: 5px; 
            }
            .details { margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-right: 4px solid #7719AA; }
            .detail-row { display: flex; margin-bottom: 10px; }
            .detail-label { font-weight: bold; width: 180px; color: #555; }
            .detail-value { flex: 1; }
            .recommendations { background-color: #E8F5E9; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📤 تصعيد حالة عميل</h1>
            </div>
            <div class="content">
                <div class="escalation-box">
                    <h3>🚩 حالة تستدعي التصعيد</h3>
                    <p>تم رفع علم التصعيد للعميل التالي ويتطلب تدخلاً إدارياً:</p>
                </div>
                
                <div class="details">
                    <div class="detail-row">
                        <div class="detail-label">اسم العميل:</div>
                        <div class="detail-value">${record.customerName}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">رقم RFQ:</div>
                        <div class="detail-value">${record.rfqNumber}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">سبب التصعيد:</div>
                        <div class="detail-value">${record.escalationReason || "غير محدد"}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">الحالة الحالية:</div>
                        <div class="detail-value">${record.currentStatus || record.quotationStatus}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">الشخص المسؤول:</div>
                        <div class="detail-value">${record.responsiblePerson}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">تاريخ آخر متابعة:</div>
                        <div class="detail-value">${new Date(record.lastFollowUpDate).toLocaleDateString("ar-SA")}</div>
                    </div>
                </div>
                
                <h3>معلومات إضافية:</h3>
                <p>${record.recommendedAction || "يحتاج العميل إلى اهتمام خاص قد يتطلب قرارات إدارية أو موارد إضافية."}</p>
                
                <div class="recommendations">
                    <h3>الإجراءات المقترحة:</h3>
                    <ol>
                        <li>مراجعة الحالة مع المسؤول المباشر</li>
                        <li>الاتصال بالعميل على المستوى الإداري</li>
                        <li>تخصيص موارد إضافية إذا لزم الأمر</li>
                        <li>وضع خطة عمل واضحة مع مواعيد نهائية</li>
                        <li>متابعة أسبوعية مع الإدارة العليا</li>
                    </ol>
                </div>
                
                <p><strong>المسؤول:</strong> مدير المبيعات</p>
                
                <p>مع خالص التقدير،<br>
                نظام أتمتة المبيعات</p>
            </div>
            <div class="footer">
                <p>هذه رسالة آلية، يرجى عدم الرد على هذا البريد الإلكتروني</p>
                <p>© ${new Date().getFullYear()} نظام إدارة المبيعات</p>
            </div>
        </div>
    </body>
    </html>
  `;
}
