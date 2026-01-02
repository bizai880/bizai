/**
 * Storage Uploader - Simple implementation
 */

export interface UploadOptions {
	maxFileSize?: number;
	allowedMimeTypes?: string[];
}

export interface UploadResult {
	success: boolean;
	url?: string;
	error?: string;
}

export const storageUploader = {
	uploadFile: async (
		file: any,
		fileName: string,
		options?: UploadOptions,
	): Promise<UploadResult> => {
		console.log("Uploading file:", fileName);
		return {
			success: true,
			url: `/uploads/${Date.now()}-${fileName}`,
		};
	},

	validateFile: (file: any, options?: UploadOptions) => ({
		valid: true,
		error: undefined,
	}),

	deleteFile: async (fileKey: string) => ({
		success: true,
	}),
};
