import { Module } from '@nestjs/common';
import { UploadController } from './controllers/upload.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Upload } from './Entities/upload.entity';
import { UploadService } from './services/uploads.services';
import { CloudinaryService } from '../Common/Utility/CloudinaryService';

@Module({
    imports: [TypeOrmModule.forFeature([Upload])],
  providers: [UploadService,CloudinaryService],
  controllers: [UploadController],
  exports: [UploadService,CloudinaryService],
})
export class UploadModule {}
