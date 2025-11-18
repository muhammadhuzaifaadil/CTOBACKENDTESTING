// project.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Query,
  UseGuards,
  Put,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { ProjectService } from '../service/project.service';
import { CreateProjectDto } from '../DTOs/project.dto';
import { UpdateProjectDto } from '../DTOs/project.dto';
import { CurrentUser } from 'src/Common/Decorator/user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ProjectStatus } from '../entity/project.entity';

@ApiTags('Projects')
@ApiBearerAuth('access-token') // Match this with 'access-token' in main.ts
@UseGuards(AuthGuard('jwt'))  
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  // @Post()
  // create(@CurrentUser('userId') userId: number,@Body() dto: CreateProjectDto) {
  //   return this.projectService.createProject(userId,dto);
  // }

//   @Post()
// @UseInterceptors(FileInterceptor('attachment'))
// async create(
//   @CurrentUser('userId') userId: number,
//   @Body() dto: CreateProjectDto,
//   @UploadedFile() file?: Express.Multer.File,
// ) {
//   const files = file ? { attachment: [file] } : undefined;
//   return this.projectService.createProject(userId, dto, files);
// }

// @Post()
// @UseInterceptors(FileInterceptor('attachment'))
// async create(
//   @CurrentUser('userId') userId: number,
//   @Body() body: any,
//   @UploadedFile() file?: Express.Multer.File,
// ) {
//   console.log('📥 Raw body received:', body); // <== Add this line

//   if (typeof body.skillsRequired === 'string') {
//     try {
//       body.skillsRequired = JSON.parse(body.skillsRequired);
//     } catch (err) {
//       console.error('❌ Failed to parse skillsRequired:', body.skillsRequired);
//       body.skillsRequired = [];
//     }
//   }

//   const files = file ? { attachment: [file] } : undefined;
//   return this.projectService.createProject(userId, body, files);
// }


@Post()
@UseInterceptors(FileInterceptor('attachment'))
async create(
  @CurrentUser('userId') userId: number,
  @Body() body: any,
  @UploadedFile() file?: Express.Multer.File,
) {
  // ✅ Parse JSON strings manually
  if (body.skillsRequired && typeof body.skillsRequired === 'string') {
    try {
      body.skillsRequired = JSON.parse(body.skillsRequired);
    } catch {
      throw new BadRequestException('Invalid skillsRequired format');
    }
  }

  // ✅ Convert to DTO properly
  const dto = plainToInstance(CreateProjectDto, body);

  // ✅ Validate (optional but recommended)
  const errors = await validate(dto);
  if (errors.length) {
    throw new BadRequestException(errors);
  }

  const files = file ? { attachment: [file] } : undefined;
  return this.projectService.createProject(userId, dto, files);
}

  @Get()
  getAll(@CurrentUser('userId') userId: number,@CurrentUser('role') userRole: any) {
    return this.projectService.getAllProjects(userId,userRole);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number,@CurrentUser('userId') userId: number,@CurrentUser('role') userRole: any) {
    return this.projectService.getProjectById(id,userId,userRole);
  }
   @Get('paginated/all')
   @ApiQuery({ name: 'filterKey', required: false, type: String, description: 'Field name to filter by (e.g. firstName, email)' })
   @ApiQuery({ name: 'filterBy', required: false,type: String, description: 'Value to search for' })
   @ApiQuery({ name: 'page', required: true, type: Number, description: 'Page number' })
   @ApiQuery({ name: 'limit', required: true, type: Number, description: 'Items per page' })
  async getPaginated(
    @CurrentUser('userId') userId: number,
    @CurrentUser('role') userRole: any,
    @Query('filterKey') filterKey?: string,
    @Query('filterBy') filterBy?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
   
  ) {

 
    return this.projectService.getProjectsPaginated(
      userRole,
      userId,
      filterBy,
      filterKey,
      page,
      limit,
    );
  }



  @Get('paginated/buyer/all')
   @ApiQuery({ name: 'filterKey', required: false, type: String, description: 'Field name to filter by (e.g. firstName, email)' })
   @ApiQuery({ name: 'filterBy', required: false,type: String, description: 'Value to search for' })
   @ApiQuery({ name: 'page', required: true, type: Number, description: 'Page number' })
   @ApiQuery({ name: 'limit', required: true, type: Number, description: 'Items per page' })
  async getPaginatedForBuyer(
    @CurrentUser('userId') userId: number,
    @CurrentUser('role') userRole: any,
    @Query('filterKey') filterKey?: string,
    @Query('filterBy') filterBy?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
   
  ) {

 
    return this.projectService.getProjectsPaginatedforBuyer(
      userRole,
      userId,
      filterBy,
      filterKey,
      page,
      limit,
    );
  }
  
@Get('paginated/seller/all')
   @ApiQuery({ name: 'filterKey', required: false, type: String, description: 'Field name to filter by (e.g. firstName, email)' })
   @ApiQuery({ name: 'filterBy', required: false,type: String, description: 'Value to search for' })
   @ApiQuery({ name: 'page', required: true, type: Number, description: 'Page number' })
   @ApiQuery({ name: 'limit', required: true, type: Number, description: 'Items per page' })
  async getPaginatedForSeller(
    @CurrentUser('userId') userId: number,
    @CurrentUser('role') userRole: any,
    @Query('filterKey') filterKey?: string,
    @Query('filterBy') filterBy?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
   
  ) {

 
    return this.projectService.getProjectsPaginatedforSeller(
      userRole,
      userId,
      filterBy,
      filterKey,
      page,
      limit,
    );
  }



  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectService.updateProject(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.projectService.deleteProject(id);
  }

   @Get('buyersummary/:id')
  getSummaryBuyer(
    @Param('id', ParseIntPipe) id: number
    // @CurrentUser('userId') userId: number
  ) {
    return this.projectService.getBuyerDetails(id);
  }

 @Get('sellersummary/:id')
getSummarySeller(
@Param('id', ParseIntPipe) id: number
) {
  return this.projectService.getSellerDetails(id);
}


  @Put('updatepublish/:id')
  async updatepublish(
    @Param('id') id: number,
  ) {
    return this.projectService.postPublish(id);
  }





//   @Get('buyersummarycached/:id')
//   getSummaryBuyerwithCache(
//     @Param('id', ParseIntPipe) id: number
//     // @CurrentUser('userId') userId: number
//   ) {
//     return this.projectService.getBuyerDetailswithCache(id);
//   }

//  @Get('sellersummarycached/:id')
// getSummarySellerwithCache(
// @Param('id', ParseIntPipe) id: number
// ) {
//   return this.projectService.getSellerDetailswithCache(id);
// }
}
