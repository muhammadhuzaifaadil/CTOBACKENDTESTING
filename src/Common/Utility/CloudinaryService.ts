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
//   async uploadFile(fileBuffer: Buffer, filename: string): Promise<UploadApiResponse> {
//     return cloudinary.uploader.upload_stream({ folder: 'uploads', public_id: filename }).end(fileBuffer);
//   }
}
