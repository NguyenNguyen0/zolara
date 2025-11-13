export interface FileMetadata {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  sizeFormatted: string;
  path: string;
  url: string;
  bucketName: string;
  uploadedAt: Date;
  lastModified: Date;
  contentType: string;
  extension: string;
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    encoding?: string;
    isImage: boolean;
    isVideo: boolean;
    isAudio: boolean;
    isDocument: boolean;
  };
}
