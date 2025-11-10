// import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { diskStorage } from 'multer';
// import { extname } from 'path';
// import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

// @ApiTags('Upload')
// @Controller('upload')
// export class UploadController {
//   @Post()
//   @UseInterceptors(
//     FileInterceptor('file', {
//       storage: diskStorage({
//         destination: './uploads', // folder where files are saved
//         filename: (req, file, callback) => {
//           const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//           const ext = extname(file.originalname);
//           callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
//         },
//       }),
//     }),
//   )
//   @ApiConsumes('multipart/form-data')
//   @ApiBody({
//     schema: {
//       type: 'object',
//       properties: {
//         file: { type: 'string', format: 'binary' },
//       },
//     },
//   })
//   uploadFile(@UploadedFile() file: Express.Multer.File) {
//     if (!file) return { message: 'No file uploaded' };
//     const fileUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/${file.path}`;
//     return { url: fileUrl, filename: file.filename };
//   }
// }





// import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
// import { CloudinaryService } from 'src/Common/Utility/CloudinaryService';

// @ApiTags('Upload')
// @Controller('upload')
// export class UploadController {
//   constructor(private readonly cloudinaryService: CloudinaryService) {}

//   @Post()
//   @ApiConsumes('multipart/form-data')
//   @ApiBody({
//     schema: {
//       type: 'object',
//       properties: {
//         file: { type: 'string', format: 'binary' },
//       },
//     },
//   })
//   async uploadFile(@UploadedFile() file: Express.Multer.File) {
//     // dynamically attach interceptor here
//     const interceptor = FileInterceptor('file', {
//       storage: this.cloudinaryService.getMulterStorage(),
//     });

//     // run interceptor manually
//     await new interceptor(null, { file } as any, () => null);

//     if (!file) return { message: 'No file uploaded' };
//     const fileUrl = file.path;
//     return { url: fileUrl, filename: file.originalname };
//   }
// }




import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CloudinaryService } from 'src/Common/Utility/CloudinaryService';
import { StorageEngine } from 'multer';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: (() => {
        // factory function: called at runtime, safe to use `this.cloudinaryService`
        const service = new CloudinaryService(); // or inject instance via module
        return service.getMulterStorage() as StorageEngine;
      })(),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) return { message: 'No file uploaded' };

    return {
      url: file.path, // Cloudinary URL
      filename: file.originalname,
    };
  }
}
