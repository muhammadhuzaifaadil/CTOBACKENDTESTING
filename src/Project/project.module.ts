// project.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entity/project.entity';
import { ProjectController } from './controller/project.controller';
import { ProjectService } from './service/project.service';
import { UploadService } from 'src/Uploads/services/uploads.services';
import { UploadModule } from 'src/Uploads/upload.module';
import { mapperService } from 'src/Common/Utility/mapper.dto';


@Module({
  imports: [TypeOrmModule.forFeature([Project]),UploadModule],
  controllers: [ProjectController],
  providers: [ProjectService,mapperService],
  exports: [ProjectService],
})
export class ProjectModule {}
