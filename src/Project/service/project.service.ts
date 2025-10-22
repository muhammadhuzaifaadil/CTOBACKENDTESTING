// project.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Project, ProjectStatus, StatusColor } from '../entity/project.entity';
import { CreateProjectDto } from '../DTOs/project.dto';
import { UpdateProjectDto } from '../DTOs/project.dto';
import { ResultDto } from '../../Common/Utility/ResultModel'; // assuming you have one
import { UploadService } from 'src/Uploads/services/uploads.services';
import { ProjectResponseDTO } from '../DTOs/projectResponse.dto';
import { mapperService } from 'src/Common/Utility/mapper.dto';
import { RoleType } from 'src/Roles/Entities/Role.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    private readonly uploadService:UploadService,
    private readonly mapper:mapperService,
  ) {}

  // 🟢 Create Project
  // async createProject(userid:number,dto: CreateProjectDto): Promise<ResultDto<Project>> {
  //   try {
  //     const project = this.projectRepo.create({
  //     ...dto,
  //     userId: userid, 
  //   });
  //     const saved = await this.projectRepo.save(project);
  //     return new ResultDto(saved, 'Project created successfully', true);
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }


  async createProject(
  userId: number,
  dto: any,
  files?: Record<string, Express.Multer.File[]>,
): Promise<ResultDto<any>> {
  try {
    // ✅ 1. Handle file upload (if provided)
    let attachmentUrl: string | null = null;
    if (files?.attachment?.[0]) {
      const fileMeta = await this.uploadService.saveFileMeta(files.attachment[0], userId);
      attachmentUrl = fileMeta.filePath;
    }

    // ✅ 2. Handle skills array
    const skills = Array.isArray(dto.skillsRequired)
      ? dto.skillsRequired.join(', ')
      : dto.skillsRequired;

      let color = "";
    if(dto.status === ProjectStatus.DRAFT)
    {
      color=StatusColor.DRAFTCOLOR.toString()
    }
    else if(dto.status === ProjectStatus.COMPLETED)
    {
      color = StatusColor.COMPLETEDCOLOR.toString()
    }
    else if(dto.status === ProjectStatus.IN_PROGRESS)
    {
      color = StatusColor.IN_PROGRESSCOLOR.toString()
    }
    else if(dto.status === ProjectStatus.PUBLISHED)
    {
      color = StatusColor.PUBLISHEDCOLOR.toString()
    }
    // let parsedSkills: string[] = [];

    // ✅ parse stringified array if necessary
    // if (typeof dto.skillsRequired === 'string') {
    //   parsedSkills = JSON.parse(dto.skillsRequired);
    // } else if (Array.isArray(dto.skillsRequired)) {
    //   parsedSkills = dto.skillsRequired;
    // }

    // ✅ 3. Create project
    const project = this.projectRepo.create({
      ...dto,
       skillsRequired: dto.skillsRequired,
      userId,
      attachment: attachmentUrl,
      status: dto.status || ProjectStatus.DRAFT,
      statusColor:color
    });
    

    const saved = await this.projectRepo.save(project);
    return new ResultDto(saved, 'Project created successfully', true);
  } catch (error) {
    throw new InternalServerErrorException(error.message);
  }
}

// Get projects for the seller
//  async getAllProjects(userId:number,userRole:string): Promise<ResultDto<ProjectResponseDTO[]>> {
//   try {
//     // Fetch projects (no user relation since we don't need user details)
//     let responseProjects:ProjectResponseDTO|null=null;
//     if(userRole===RoleType.SELLER){
//     const projects = await this.projectRepo.find();

//     // Map to DTOs
//        responseProjects = projects.map(
//       (p) => new ProjectResponseDTO(this.mapper.mapToProjectDTO(p)),
//     );
// }
// else if(userRole===RoleType.BUYER)
// {
//   const projects = await this.projectRepo.find({where:{userId}});
//   responseProjects = projects.map(
//     (p)=>new ProjectResponseDTO(this.mapper.mapToProjectDTO(p)),
//   )
// }
//     return new ResultDto(
//       responseProjects,
//       'All projects fetched successfully',
//       true,
//     );
//   } catch (error) {
//     throw new InternalServerErrorException(error.message);
//   }
// }

async getAllProjects(
  userId: number,
  userRole: string,
): Promise<ResultDto<ProjectResponseDTO[]>> {
  try {
    let projects: Project[] = [];

    if (userRole === RoleType.SELLER) {
      // Seller: can view ALL buyer projects with limited buyer info
      projects = await this.projectRepo.find({
        relations: ['user'], // Include user info for name, email, etc.

      });
    } else if (userRole === RoleType.BUYER) {
      // Buyer: can view ONLY their own projects
      projects = await this.projectRepo.find({
        where: { user: { id: userId } },
        order:{id:'desc'},
        take:3

      });
    }

    // Map to DTOs
    const responseProjects = projects.map(
      (p) =>
        new ProjectResponseDTO({
          id: p.id,
          title: p.title,
          outline: p.outline,
          requirements: p.requirements,
          budgetRange: p.budgetRange,
          timeline: p.timeline,
          skillsRequired: p.skillsRequired,
          attachment: p.attachment,
          status: p.status,
          statusColor: p.statusColor,
          ...(userRole === RoleType.SELLER && p.user
            ? {
                buyerInfo: {
                  id: p.user.id,
                  name: p.user.firstName + p.user.lastName,
                  email: p.user.email,
                },
              }
            : {}),
        }),
    );

    return new ResultDto(
      responseProjects,
      'Projects fetched successfully',
      true,
    );
  } catch (error) {
    throw new InternalServerErrorException(error.message);
  }
}


// async getProjectById(id: number): Promise<ResultDto<ProjectResponseDTO>> {
//   try {
//     const project = await this.projectRepo.findOne({ where: { id } });

//     if (!project)
//       throw new NotFoundException(`Project with ID ${id} not found`);

//     const responseProject = new ProjectResponseDTO(this.mapper.mapToProjectDTO(project));

//     return new ResultDto(
//       responseProject,
//       'Project fetched successfully',
//       true,
//     );
//   } catch (error) {
//     throw new InternalServerErrorException(error.message);
//   }
// }

async getProjectById(
  id: number,
  userId: number,
  userRole: string,
): Promise<ResultDto<ProjectResponseDTO>> {
  try {
    let project;

    if (userRole === RoleType.SELLER) {
      // 🟢 Seller can view any project
      project = await this.projectRepo.findOne({
        where: { id },
        relations: ['user'],
      });
    } else if (userRole === RoleType.BUYER) {
      // 🔒 Buyer can only view their own projects
      project = await this.projectRepo.findOne({
        where: { id, user: { id: userId } },
        relations: ['user'],
      });
    }

    // return not found directly in future
    if (!project)
      throw new NotFoundException(`Project with ID ${id} not found`);

    const responseProject = new ProjectResponseDTO({
      id: project.id,
      title: project.title,
      outline: project.outline,
      requirements: project.requirements,
      budgetRange: project.budgetRange,
      timeline: project.timeline,
      skillsRequired: project.skillsRequired,
      attachment: project.attachment,
      status: project.status,
      ...(userRole === RoleType.SELLER && project.user
        ? {
            buyerInfo: {
              id: project.user.id,
              name: `${project.user.firstName} ${project.user.lastName}`,
              email: project.user.email,
            },
          }
        : {}),
    });

    return new ResultDto(responseProject, 'Project fetched successfully', true);
  } catch (error) {
    if (error instanceof NotFoundException) throw error;
    throw new InternalServerErrorException(error.message);
  }
}



   // 🧩 FILTER + PAGINATION (like getUsersPaginated)


// async getProjectsPaginated(
//   userRole: string,
//   userId?: number,
//   filterBy?: any,
//   filterKey?: string, // e.g. 'title', 'skillsRequired'
//   page: number = 1,
//   limit: number = 10,
// ): Promise<ResultDto<{
//   projects: ProjectResponseDTO[];
//   pagination: {
//     page: number;
//     limit: number;
//     totalCount: number;
//     totalPages: number;
//   };
// }>> {
//   try {
//     const skip = (page - 1) * limit;

//     const qb = this.projectRepo
//       .createQueryBuilder('project')
//       .leftJoinAndSelect('project.user', 'user');

//     // 👇 Role-based visibility
//     if (userRole === RoleType.BUYER && userId) {
//       qb.where('user.id = :userId', { userId });
//     }

//     // 🔍 Apply dynamic filters
//     if (filterBy && filterKey) {
//       qb.andWhere(`project.${filterKey} ILIKE :filterBy`, {
//         filterBy: `%${filterBy}%`,
//       });
//     }

//     // 📊 Total count before pagination
//     const totalCount = await qb.getCount();

//     // 📄 Pagination & sorting
//     qb.orderBy('project.id', 'ASC').skip(skip).take(limit);

//     const projects = await qb.getMany();
//     const totalPages = Math.ceil(totalCount / limit);

//     // ✅ Map to response DTOs
//     const responseProjects = projects.map(
//       (p) =>
//         new ProjectResponseDTO({
//           id: p.id,
//           title: p.title,
//           outline: p.outline,
//           requirements: p.requirements,
//           budgetRange: p.budgetRange,
//           timeline: p.timeline,
//           skillsRequired: p.skillsRequired,
//           attachment: p.attachment,
//           status: p.status,
//           ...(userRole === RoleType.SELLER && p.user
//             ? {
//                 buyerInfo: {
//                   id: p.user.id,
//                   name: p.user.firstName + p.user.lastName,
//                   email: p.user.email,
//                 },
//               }
//             : {}),
//         }),
//     );

//     return new ResultDto(
//       {
//         projects: responseProjects,
//         pagination: {
//           page,
//           limit,
//           totalCount,
//           totalPages,
//         },
//       },
//       `Projects retrieved successfully (page ${page} of ${totalPages})`,
//       true,
//     );
//   } catch (error) {
//     throw new InternalServerErrorException(error.message);
//   }
// }


async getProjectsPaginated(
  userRole: string,
  userId?: number,
  filterBy?: any,
  filterKey?: string, // e.g. 'title', 'skillsRequired', 'status'
  page: number = 1,
  limit: number = 10,
): Promise<ResultDto<{
  projects: ProjectResponseDTO[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}>> {
  try {
    const skip = (page - 1) * limit;

    const qb = this.projectRepo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.user', 'user')
      // 👇 Join bids to count how many each project has
      .leftJoin('project.bids', 'bids')
      .loadRelationCountAndMap('project.bidCount', 'project.bids');

    // 👇 Role-based visibility
    if (userRole === RoleType.BUYER && userId) {
      qb.where('user.id = :userId', { userId });
    }

    if (userRole === RoleType.SELLER) {
  qb.where('project.status = :status', { status: ProjectStatus.PUBLISHED });
}
    // 🔍 Apply dynamic filters
    // if (filterBy && filterKey) {
    //   if (filterKey === 'status') {
    //     // ✅ Normalize filter value to match enum values
    //     const normalized = filterBy.trim().toLowerCase();

    //     // Map user input to valid enum
    //     const statusMap: Record<string, ProjectStatus> = {
    //       draft: ProjectStatus.DRAFT,
    //       published: ProjectStatus.PUBLISHED,
    //       'in progress': ProjectStatus.IN_PROGRESS,
    //       completed: ProjectStatus.COMPLETED,
    //     };

    //     const matchedStatus = statusMap[normalized];

    //     if (matchedStatus) {
    //       qb.andWhere('project.status = :status', { status: matchedStatus });
    //     } else {
    //       // if invalid status filter provided, return no results
    //       qb.andWhere('1 = 0');
    //     }
    //   } else {
    //     // ✅ Default string filtering for non-enum columns
    //     qb.andWhere(`project.${filterKey} ILIKE :filterBy`, {
    //       filterBy: `%${filterBy}%`,
    //     });
    //   }
    // }



    if (filterBy && filterKey) {
  if (filterKey === 'status') {
    const normalized = filterBy.trim().toLowerCase();

    const statusMap: Record<string, ProjectStatus> = {
      draft: ProjectStatus.DRAFT,
      published: ProjectStatus.PUBLISHED,
      'in progress': ProjectStatus.IN_PROGRESS,
      completed: ProjectStatus.COMPLETED,
    };

    const matchedStatus = statusMap[normalized];

    if (matchedStatus) {
      qb.andWhere('project.status = :status', { status: matchedStatus });
    } else {
      qb.andWhere('1 = 0');
    }
  } 
  else if (filterKey === 'search') {
    qb.andWhere(
  `(project.title ILIKE :term OR project.outline ILIKE :term OR project."skillsRequired"::text ILIKE :term)`,
  { term: `%${filterBy}%` },
);

  } 
  else {
    qb.andWhere(`project.${filterKey} ILIKE :filterBy`, {
      filterBy: `%${filterBy}%`,
    });
  }
}


    // 📊 Total count before pagination
    const totalCount = await qb.getCount();

    // 📄 Pagination & sorting
    qb.orderBy('project.id', 'ASC').skip(skip).take(limit);

    const projects = await qb.getMany();
    const totalPages = Math.ceil(totalCount / limit);

    // ✅ Map to response DTOs
    const responseProjects = projects.map(
      (p) =>
        new ProjectResponseDTO({
          id: p.id,
          title: p.title,
          outline: p.outline,
          requirements: p.requirements,
          budgetRange: p.budgetRange,
          timeline: p.timeline,
          skillsRequired: p.skillsRequired,
          attachment: p.attachment,
          status: p.status,
          bidCount: (p as any).bidCount || 0, // 👈 added

          ...(userRole === RoleType.SELLER && p.user
            ? {
                buyerInfo: {
                  id: p.user.id,
                  name: p.user.firstName + p.user.lastName,
                  email: p.user.email,
                },
              }
            : {}),
        }),
    );

    return new ResultDto(
      {
        projects: responseProjects,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
        },
      },
      `Projects retrieved successfully (page ${page} of ${totalPages})`,
      true,
    );
  } catch (error) {
    throw new InternalServerErrorException(error.message);
  }
}




  // 🟠 Update Project
  async updateProject(
    id: number,
    dto: UpdateProjectDto,
  ): Promise<ResultDto<Project>> {
    const project = await this.projectRepo.findOne({ where: { id } });
    if (!project) throw new NotFoundException(`Project with ID ${id} not found`);
    // Allow editing only Draft or Published
// if (![ProjectStatus.DRAFT, ProjectStatus.PUBLISHED].includes(project.status)) {
//   throw new BadRequestException('Project cannot be edited after award.');
// }
    Object.assign(project, dto);
    const updated = await this.projectRepo.save(project);

    return new ResultDto(updated, 'Project updated successfully', true);
  }

  // 🔴 Delete Project
  async deleteProject(id: number): Promise<ResultDto<null>> {
    const project = await this.projectRepo.findOne({ where: { id } });
    if (!project) throw new NotFoundException(`Project with ID ${id} not found`);
if (![ProjectStatus.DRAFT, ProjectStatus.PUBLISHED].includes(project.status)) {
  throw new BadRequestException('Project cannot be deleted after award.');
}
// create a logic if user delete grater than 5 time than reached limit
// if (user.deletesThisMonth >= 5) {
//   throw new BadRequestException('You have reached your delete limit for this month.');
// }
    await this.projectRepo.remove(project);
    return new ResultDto(null, 'Project deleted successfully', true);
  }
}
