import { Module } from '@nestjs/common';
import { UploadController } from './controllers/upload.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Upload } from './Entities/upload.entity';
import { UploadService } from './services/uploads.services';

@Module({
    imports: [TypeOrmModule.forFeature([Upload])],
  providers: [UploadService],
  controllers: [UploadController],
  exports: [UploadService],
})
export class UploadModule {}
