// src/upload/upload.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload } from '../Entities/upload.entity';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(Upload)
    private readonly uploadRepo: Repository<Upload>,
  ) {}

  async saveFileMeta(
    file: Express.Multer.File,
    uploadedBy?: number,
  ): Promise<Upload> {
    const upload = this.uploadRepo.create({
      fileName: file.originalname,
      filePath: file.path.replace(/\\/g, '/'), // normalize path
      fileType: file.mimetype,
      fileSize: file.size,
      uploadedBy,
    });
    return this.uploadRepo.save(upload);
  }
}
