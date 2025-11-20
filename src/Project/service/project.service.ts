// project.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository, SelectQueryBuilder } from 'typeorm';
import { Project, ProjectStatus, StatusColor } from '../entity/project.entity';
import { CreateProjectDto } from '../DTOs/project.dto';
import { UpdateProjectDto } from '../DTOs/project.dto';
import { ResultDto } from '../../Common/Utility/ResultModel'; // assuming you have one
import { UploadService } from 'src/Uploads/services/uploads.services';
import { ProjectResponseDTO } from '../DTOs/projectResponse.dto';
import { mapperService } from 'src/Common/Utility/mapper.dto';
import { RoleType } from 'src/Roles/Entities/Role.entity';
import { Bid, BidStatus } from 'src/Bid/Entity/Bid.entity';
import { CloudinaryService } from 'src/Common/Utility/CloudinaryService';
import { TemplateQuestion } from 'src/Template/Entities/TemplateQuestion.entity';
// import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import * as cacheManager_1 from 'cache-manager'; // ✅ correct Cache type

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Bid)
    private readonly bidRepo:Repository<Bid>,
    @InjectRepository(TemplateQuestion)
    private readonly tqRepo:Repository<TemplateQuestion>,
    private readonly uploadService:UploadService,
    private readonly mapper:mapperService,
    private readonly cloudinaryService:CloudinaryService
  //    @Inject(CACHE_MANAGER)
  // private readonly cacheManager: cacheManager_1.Cache, // ✅ now has get/set/del
  ) {}

  // 🟢 Create Project save local attachements
  async createProject(
  userId: number,
  dto: any,
  files?: Record<string, Express.Multer.File[]>,
): Promise<ResultDto<any>> {
  try {
    // ✅ 1. Handle file upload (if provided)
    let attachmentUrl:any = null;
    if (files?.attachment?.[0]) {
      const fileMeta = await this.cloudinaryService.uploadFile(files.attachment[0]);
      attachmentUrl = fileMeta;
    }
    else if(dto?.attachment)
    {
      attachmentUrl = dto.attachment;
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
    else{
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
      statusColor:color,
      templateId:dto.templateId
    });
    

    const saved = await this.projectRepo.save(project);
   if (dto.templateQuestions && dto.templateQuestions.length > 0) {
  const templateAnswers = dto.templateQuestions.map((q) =>
    this.tqRepo.create({
      questionText: q.questionText,
      value: q.questionValue,
      userId: userId,
      projectId: Object(saved).id,     // ✔ saved is NOT an array; it's a single object
      templateId: dto.templateId,
    })
  );

  await this.tqRepo.save(templateAnswers);
}
    // when working on frontend change this to savedtemplateanswer
    return new ResultDto(saved, 'Project created successfully', true);
  } catch (error) {
    throw new InternalServerErrorException(error.message);
  }
}


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
    qb.orderBy('project.id', 'DESC').skip(skip).take(limit);

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

async getProjectsPaginatedforBuyer(
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

      qb.where('user.id = :userId', { userId });



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
    qb.orderBy('project.id', 'DESC').skip(skip).take(limit);

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


async getProjectsPaginatedforSeller(
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

  qb.where('project.status = :status', { status: ProjectStatus.PUBLISHED });



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
    qb.orderBy('project.id', 'DESC').skip(skip).take(limit);

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
    const project = await this.projectRepo.findOne({ where: { id }});
    // project?.bids.status
    if (!project) throw new NotFoundException(`Project with ID ${id} not found`);
    // Allow editing only Draft or Published
// if (![ProjectStatus.DRAFT, ProjectStatus.PUBLISHED].includes(project.status)) {
//   throw new BadRequestException('Project cannot be edited after award.');
// }
if(ProjectStatus.IN_PROGRESS.includes(project.status))
{
  throw new BadRequestException('Project cannot be edited after award.');
}
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


  // Get Buyer Dashboard summary

//   async getDetails(id:number):Promise<ResultDto<any>|any>
//   {
//     try {
// const [projects, count] = await this.projectRepo.findAndCount({
//   where: {
//     userId: id,
//     status: Not(ProjectStatus.COMPLETED),
//   },
// });

// const [pendingBids,pcount] = await this.projectRepo.findAndCount({where:
//   {userId:id, bids:{status:BidStatus.PENDING}},
//    relations: ["bids"],
// },
// )
// const [completedProjects,cCount] = await this.projectRepo.findAndCount({where:{userId:id,status:ProjectStatus.COMPLETED}})
// const projectSpent = await this.projectRepo.find({
//   where: {
//     userId: id,
//     bids: {
//       status: BidStatus.ACCEPTED,
//     },
//   },
//   relations: ["bids"], // Include bids relation
//   select: {
//     id: true,
//     bids: {
//       bidAmount: true,
//     },
//   },
// });

// const totalSpent = Math.round(
//       projectSpent.reduce((sum, project) => {
//         const projectTotal = project.bids?.reduce((bSum, bid) => {
//           const bidAmount = parseFloat(bid.bidAmount as any) || 0;
//           return bSum + bidAmount;
//         }, 0);
//         return sum + projectTotal;
//       }, 0)
//     );

// return new ResultDto(
//   {
//     "activeProjects":count,
//     "pendingBids":pcount,
//     "completed":cCount,
//     "totalSpent":totalSpent
//   },
//   "Data Successfully fetched",
//   true
// )

// } catch (error) {
//       return new InternalServerErrorException(error)
//     }
//   }
//   // runs in parrallel faster than before still making 4 db calls
//   async getDetails(id: number): Promise<ResultDto<any> | any> {
//   try {
//     const [
//       activeProjects,
//       completedProjects,
//       pendingBids,
//       acceptedProjects
//     ] = await Promise.all([
//       // Count active projects
//       this.projectRepo.count({
//         where: {
//           userId: id,
//           status: Not(ProjectStatus.COMPLETED),
//         },
//       }),

//       // Count completed projects
//       this.projectRepo.count({
//         where: {
//           userId: id,
//           status: ProjectStatus.COMPLETED,
//         },
//       }),

//       // Count pending bids
//       this.bidRepo.count({
//         where: {
//           project: { userId: id },
//           status: BidStatus.PENDING,
//         },
//         relations: ["project"],
//       }),

//       // Find accepted bids (to calculate total spent)
//       this.bidRepo.find({
//         where: {
//           project: { userId: id },
//           status: BidStatus.ACCEPTED,
//         },
//         select: ["bidAmount"],
//         relations: ["project"],
//       }),
//     ]);

//     const totalSpent = Math.round(
//       acceptedProjects.reduce((sum, bid) => {
//         const bidAmount = parseFloat(bid.bidAmount as any) || 0;
//         return sum + bidAmount;
//       }, 0)
//     );

//     return new ResultDto(
//       {
//         activeProjects,
//         pendingBids,
//         completed: completedProjects,
//         totalSpent,
//       },
//       "Data successfully fetched",
//       true
//     );
//   } catch (error) {
//     return new InternalServerErrorException(error);
//   }
// }

// buyer summary querybuilder reduces 4 db calls to one
async getBuyerDetails(id: number): Promise<ResultDto<any> | any> {
  const queryRunner = this.projectRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
  try {
    

    // Aggregate everything in a single set of queries
    const result = await queryRunner.manager.query(`
      SELECT
        COUNT(*) FILTER (WHERE status != '${ProjectStatus.COMPLETED}') AS "activeProjects",
        COUNT(*) FILTER (WHERE status = '${ProjectStatus.COMPLETED}') AS "completedProjects",
        (
          SELECT COUNT(*)
          FROM "bids" b
          INNER JOIN "projects" p ON p.id = b."projectId"
          WHERE p."userId" = $1 AND b.status = '${BidStatus.PENDING}'
        ) AS "pendingBids",
        COALESCE((
          SELECT SUM(CAST(b."bidAmount" AS FLOAT))
          FROM "bids" b
          INNER JOIN "projects" p ON p.id = b."projectId"
          WHERE p."userId" = $1 AND b.status = '${BidStatus.ACCEPTED}'
        ), 0) AS "totalSpent"
      FROM "projects"
      WHERE "userId" = $1
    `, [id]);

    const data = result[0];

    return new ResultDto(
      {
        activeProjects: data.activeProjects,
        pendingBids: data.pendingBids,
        completed: data.completedProjects,
        totalSpent: String(data.totalSpent),
      },
      "Data Successfully fetched",
      true
    );
  } catch (error) {
    return new InternalServerErrorException(error);
  }finally {
    await queryRunner.release();  // ✅ IMPORTANT
  }
}

// async getBuyerDetailswithCache(id: number): Promise<ResultDto<any>> {
//  const cacheKey = `buyer:details:${id}`;

//     // ✅ Get cached data
//     const cached: any = await this.cacheManager.get(cacheKey);
//     if (cached) {
//       return new ResultDto(cached, "Data fetched from cache", true);
//     }

//   const queryRunner = this.projectRepo.manager.connection.createQueryRunner();
//   await queryRunner.connect();
//   try {
//     const result = await queryRunner.manager.query(`
//       SELECT
//         COUNT(*) FILTER (WHERE status != '${ProjectStatus.COMPLETED}') AS "activeProjects",
//         COUNT(*) FILTER (WHERE status = '${ProjectStatus.COMPLETED}') AS "completedProjects",
//         (
//           SELECT COUNT(*) FROM "bids" b
//           INNER JOIN "projects" p ON p.id = b."projectId"
//           WHERE p."userId" = $1 AND b.status = '${BidStatus.PENDING}'
//         ) AS "pendingBids",
//         COALESCE((
//           SELECT SUM(CAST(b."bidAmount" AS FLOAT))
//           FROM "bids" b
//           INNER JOIN "projects" p ON p.id = b."projectId"
//           WHERE p."userId" = $1 AND b.status = '${BidStatus.ACCEPTED}'
//         ), 0) AS "totalSpent"
//       FROM "projects"
//       WHERE "userId" = $1
//     `, [id]);

//     const data = {
//       activeProjects: result[0].activeProjects,
//       pendingBids: result[0].pendingBids,
//       completed: result[0].completedProjects,
//       totalSpent: String(result[0].totalSpent),
//     };

//     await this.cacheManager.set(cacheKey, data, 300); // Cache for 5 min
//     return new ResultDto(data, "Data successfully fetched", true);
//   } finally {
//     await queryRunner.release();
//   }
// }


// async getSellerDetailswithCache(id: number): Promise<ResultDto<any>> {
//   const cacheKey = `seller:details:${id}`;
//   const cached = await this.cacheManager.get(cacheKey);

//   if (cached) {
//     return new ResultDto(cached, "Data fetched from cache", true);
//   }

//   const queryRunner = this.bidRepo.manager.connection.createQueryRunner();
//   await queryRunner.connect();
//   try {
//     const result = await queryRunner.manager.query(`
//       SELECT
//         COUNT(*) AS "activeBids",
//         COUNT(*) FILTER (WHERE b.status = '${BidStatus.ACCEPTED}') AS "projectsWon",
//         COUNT(*) FILTER (WHERE p.status = '${ProjectStatus.COMPLETED}') AS "projectsCompleted",
//         COALESCE(
//           SUM(
//             CASE WHEN b.status = '${BidStatus.ACCEPTED}' 
//             THEN CAST(b."bidAmount" AS FLOAT) 
//             ELSE 0 END
//           ), 0) AS "totalEarnings"
//       FROM "bids" b
//       LEFT JOIN "projects" p ON p.id = b."projectId"
//       WHERE b."sellerId" = $1
//     `, [id]);

//     const data = {
//       ActiveBids: Number(result[0].activeBids) || 0,
//       ProjectsWon: Number(result[0].projectsWon) || 0,
//       Completed: Number(result[0].projectsCompleted) || 0,
//       TotalEarnings: Math.round(Number(result[0].totalEarnings) || 0),
//     };

//     await this.cacheManager.set(cacheKey, data, 300); // Cache 5 min
//     return new ResultDto(data, "Data fetched successfully", true);
//   } finally {
//     await queryRunner.release();
//   }
// }



// seller summary

// async getSellerDetails(id:number):Promise<ResultDto<any> | any>
// {
//   try {
//     // const id = Number(userId);
//     const [activeBid,count] = await this.bidRepo.findAndCount({where:{seller:{id}}})
//     const [projectsWon,pcount] = await this.bidRepo.findAndCount({where:{seller:{id},status:BidStatus.ACCEPTED}})
//     const [projectsCompleted,cCount] = await this.bidRepo.findAndCount(
//       {
//         where:{seller:{id},project:{status:ProjectStatus.COMPLETED}},
//         relations:["project"]
//       }
//     )
//     const [acceptedBids, totalCount] = await this.bidRepo.findAndCount({
//   where: {
//     seller: { id },
//     status: BidStatus.ACCEPTED,
//   },
//   select: ['bidAmount'],
// });

// const totalEarnings = Math.round(
//   acceptedBids.reduce((sum, bid) => sum + Number(bid.bidAmount || 0), 0)
// );

// return new ResultDto({
//   ActiveBids:count,
//   ProjectsWon:pcount,
//   Completed:cCount,
//   TotalEarnings:totalEarnings
// },"Data Fetched Successfully",true)
    
//   } catch (error) {
//     return new InternalServerErrorException(error)
//   }
// }
// 1 round trip
async getSellerDetails(id: number): Promise<ResultDto<any> | any> {
  const queryRunner = this.bidRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
  try {
    

    const result = await queryRunner.manager.query(
      `
      SELECT
        COUNT(*) AS "activeBids",
        COUNT(*) FILTER (WHERE b.status = '${BidStatus.ACCEPTED}') AS "projectsWon",
        COUNT(*) FILTER (
          WHERE p.status = '${ProjectStatus.COMPLETED}'
        ) AS "projectsCompleted",
        COALESCE(
          SUM(
            CASE WHEN b.status = '${BidStatus.ACCEPTED}' 
            THEN CAST(b."bidAmount" AS FLOAT) 
            ELSE 0 END
          ), 
        0) AS "totalEarnings"
      FROM "bids" b
      LEFT JOIN "projects" p ON p.id = b."projectId"
      WHERE b."sellerId" = $1
      `,
      [id]
    );

    const data = result[0];

    return new ResultDto(
      {
        ActiveBids: Number(data.activeBids) || 0,
        ProjectsWon: Number(data.projectsWon) || 0,
        Completed: Number(data.projectsCompleted) || 0,
        TotalEarnings: Math.round(Number(data.totalEarnings) || 0),
      },
      "Data Fetched Successfully",
      true
    );

  } catch (error) {
    return new InternalServerErrorException(error);
  }
  finally {
    await queryRunner.release();  // ✅ IMPORTANT
  }
}


async postPublish(id:number):Promise<ResultDto<any>>
{
  const project = await this.projectRepo.findOne({where:{id}});
  if(!project){
    throw new BadRequestException("project does not exists!");
  }
  project.status = ProjectStatus.PUBLISHED;
  project.statusColor = StatusColor.PUBLISHEDCOLOR;
  this.projectRepo.save(project);
  return new ResultDto([],"Project is now published",true);
  
}
}
