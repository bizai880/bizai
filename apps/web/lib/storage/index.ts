export type { FileInfo, UploadOptions, UploadResult } from "./uploader";
export {
	deleteFile,
	generatePresignedUrl,
	storageUploader,
	uploadFile,
	uploadFiles,
	validateFile,
} from "./uploader";

// Export default
import storageUploader from "./uploader";
export default storageUploader;
