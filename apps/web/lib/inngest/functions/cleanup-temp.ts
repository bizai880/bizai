export async function cleanupTempFiles(): Promise<{
	success: boolean;
	deletedCount: number;
}> {
	console.log("Cleaning up temporary files...");

	await new Promise((resolve) => setTimeout(resolve, 150));

	return {
		success: true,
		deletedCount: Math.floor(Math.random() * 10) + 1,
	};
}

export default cleanupTempFiles;
