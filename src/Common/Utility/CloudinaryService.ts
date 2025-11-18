import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { StorageEngine } from 'multer';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  // Return Cloudinary instance if needed elsewhere
  getCloudinaryInstance() {
    return cloudinary;
  }

  // Storage engine for Multer
  getMulterStorage(): StorageEngine {
    return new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'uploads', // optional folder in Cloudinary
        format: async (req, file) => file.mimetype.split('/')[1], // auto set extension
        public_id: (req, file) => `${Date.now()}-${file.originalname}`,
      } as any, // cast to any to avoid TS errors
    });
  }

  // Optional: direct upload from buffer
 // Upload from buffer instead of file.path
  async uploadFile(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'sellers',
          public_id: `${Date.now()}-${file.originalname}`,
        },
        (error, result: UploadApiResponse) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        },
      );

      // send the file buffer to the stream
      if (!file.buffer) return reject(new Error('File buffer is missing'));
      uploadStream.end(file.buffer);
    });
  }
}
