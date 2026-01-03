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
		_file: any,
		fileName: string,
		_options?: UploadOptions,
	): Promise<UploadResult> => {
		console.log("Uploading file:", fileName);
		return {
			success: true,
			url: `/uploads/${Date.now()}-${fileName}`,
		};
	},

	validateFile: (_file: any, _options?: UploadOptions) => ({
		valid: true,
		error: undefined,
	}),

	deleteFile: async (_fileKey: string) => ({
		success: true,
	}),
};
