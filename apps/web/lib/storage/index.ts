export {
	storageUploader,
	uploadFile,
	uploadFiles,
	deleteFile,
	generatePresignedUrl,
	validateFile,
} from "./uploader";
export type { UploadOptions, UploadResult, FileInfo } from "./uploader";

// Export default
import storageUploader from "./uploader";
export default storageUploader;
