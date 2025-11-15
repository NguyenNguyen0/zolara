import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { FileMetadata } from './interfaces/file-metadata.interface';

@Injectable()
export class StorageService {
  private supabase;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_SERVICE_KEY'),
    );
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private getFileType(mimeType: string): {
    isImage: boolean;
    isVideo: boolean;
    isAudio: boolean;
    isDocument: boolean;
  } {
    const type = mimeType.split('/')[0];
    return {
      isImage: type === 'image',
      isVideo: type === 'video',
      isAudio: type === 'audio',
      isDocument:
        mimeType.includes('pdf') ||
        mimeType.includes('document') ||
        mimeType.includes('sheet') ||
        mimeType.includes('presentation'),
    };
  }

  private async getImageMetadata(
    file: Express.Multer.File,
  ): Promise<{ width?: number; height?: number }> {
    if (!file.mimetype.startsWith('image/')) {
      return {};
    }

    try {
      // Here you could use sharp or another image processing library
      // For now, we'll return empty dimensions
      return {};
    } catch (error) {
      return {};
    }
  }

  private async buildFileMetadata(
    file: Express.Multer.File,
    uploadResult: any,
    bucketName: string,
    path: string,
  ): Promise<FileMetadata> {
    const fileExt = file.originalname.split('.').pop();
    const fileTypes = this.getFileType(file.mimetype);
    const imageMetadata = await this.getImageMetadata(file);

    return {
      id: uploadResult.path,
      originalName: file.originalname,
      fileName: path.split('/').pop(),
      mimeType: file.mimetype,
      size: file.size,
      sizeFormatted: this.formatFileSize(file.size),
      path: uploadResult.path,
      url: this.supabase.storage.from(bucketName).getPublicUrl(path).data
        .publicUrl,
      bucketName: bucketName,
      uploadedAt: new Date(),
      lastModified: new Date(),
      contentType: file.mimetype,
      extension: fileExt,
      metadata: {
        ...fileTypes,
        ...imageMetadata,
        encoding: file.encoding,
      },
    };
  }

  /**
   * Upload multiple files to Supabase Storage
   * @param files Array of files to upload
   * @param bucketName Name of the bucket to upload to
   * @param path Optional path within the bucket
   * @returns Array of uploaded file URLs and file data
   */
  async uploadFiles(
    files: Express.Multer.File[],
    bucketName: string,
    path: string = '',
  ): Promise<FileMetadata[]> {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    const results: FileMetadata[] = [];

    for (const file of files) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        throw new BadRequestException(
          `File ${file.originalname} exceeds maximum size of 10MB`,
        );
      }

      // Generate unique filename
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const fullPath = path ? `${path}/${fileName}` : fileName;

      try {
        // Upload file to Supabase Storage
        const { data, error } = await this.supabase.storage
          .from(bucketName)
          .upload(fullPath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (error) {
          throw new BadRequestException(
            `Error uploading file ${file.originalname}: ${error.message}`,
          );
        }

        const metadata = await this.buildFileMetadata(
          file,
          data,
          bucketName,
          fullPath,
        );
        results.push(metadata);
      } catch (error) {
        throw new BadRequestException(
          `Error uploading file ${file.originalname}: ${error.message}`,
        );
      }
    }

    return results;
  }

  /**
   * Update a file in Supabase Storage
   * @param file New file to upload
   * @param oldPath Path of the file to update
   * @param bucketName Name of the bucket
   * @returns Updated file URL and data
   */
  async updateFile(
    file: Express.Multer.File,
    oldPath: string,
    bucketName: string,
  ): Promise<FileMetadata> {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File ${file.originalname} exceeds maximum size of 10MB`,
      );
    }

    try {
      // Delete old file
      await this.deleteFile(oldPath, bucketName);

      // Upload new file with the same path
      const { data, error } = await this.supabase.storage
        .from(bucketName)
        .upload(oldPath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        throw new BadRequestException(
          `Error updating file ${file.originalname}: ${error.message}`,
        );
      }

      return this.buildFileMetadata(file, data, bucketName, oldPath);
    } catch (error) {
      throw new BadRequestException(
        `Error updating file ${file.originalname}: ${error.message}`,
      );
    }
  }

  /**
   * Delete a file from Supabase Storage
   * @param path Path of the file to delete
   * @param bucketName Name of the bucket
   * @returns Success message
   */
  async deleteFile(path: string, bucketName: string) {
    try {
      const { error } = await this.supabase.storage
        .from(bucketName)
        .remove([path]);

      if (error) {
        throw new BadRequestException(
          `Error deleting file at ${path}: ${error.message}`,
        );
      }

      return { message: `File at ${path} deleted successfully` };
    } catch (error) {
      throw new BadRequestException(
        `Error deleting file at ${path}: ${error.message}`,
      );
    }
  }

  /**
   * Delete multiple files from Supabase Storage
   * @param paths Array of file paths to delete
   * @param bucketName Name of the bucket
   * @returns Success message
   */
  async deleteFiles(paths: string[], bucketName: string) {
    try {
      const { error } = await this.supabase.storage
        .from(bucketName)
        .remove(paths);

      if (error) {
        throw new BadRequestException(`Error deleting files: ${error.message}`);
      }

      return { message: `${paths.length} files deleted successfully` };
    } catch (error) {
      throw new BadRequestException(`Error deleting files: ${error.message}`);
    }
  }
}
