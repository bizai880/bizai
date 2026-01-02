export async function processDocument(
	documentId: string,
	options?: any,
): Promise<{ success: boolean; processedUrl?: string }> {
	console.log("Processing document:", documentId);

	await new Promise((resolve) => setTimeout(resolve, 300));

	return {
		success: true,
		processedUrl: `/processed/${documentId}-${Date.now()}`,
	};
}

export default processDocument;
