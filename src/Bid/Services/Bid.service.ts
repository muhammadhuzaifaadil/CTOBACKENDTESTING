// project.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository, SelectQueryBuilder } from 'typeorm';

import { ResultDto } from '../../Common/Utility/ResultModel'; // assuming you have one
import { Bid, BidStatus } from '../Entity/Bid.entity';
import { User } from 'src/User/Entities/User.entity';
import { Project } from 'src/Project/entity/project.entity';
import { postBidDTO } from '../DTOs/postBid.dto';
import { RoleType } from 'src/Roles/Entities/Role.entity';
import { BidResponseDTO } from '../DTOs/BidResponseDTO';
import { ProjectWithBidsDTO, SellerBidDTO } from '../DTOs/ProjectBidResponseDTO';

@Injectable()
export class BidService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepo: Repository<Bid>,
    @InjectRepository(User)
    private readonly userRepo:Repository<User>,
    @InjectRepository(Project)
    private readonly projectRepo:Repository<Project>
  ) {}

// async createBid(sellerId: number, dto: postBidDTO): Promise<ResultDto<Bid|any>> {
//   const seller = await this.userRepo.findOne({ where: { id: sellerId } });
//   if (!seller) {
//     throw new BadRequestException('Seller not found.');
//   }

//   const project = await this.projectRepo.findOne({ where: { id: dto.ProjectId } });
//   if (!project || project.status !== 'Published') {
//     throw new BadRequestException('You can only bid on published projects.');
//   }
//   // const bidProject = await this.bidRepo.findOne({
//   //   where:{project:{id:dto.ProjectId},seller:{id:sellerId}}
//   // })
//   // optimized of above code
//   const alreadyBid = await this.bidRepo
//   .createQueryBuilder('bid')
//   .where('bid.projectId = :projectId', { projectId: dto.ProjectId })
//   .andWhere('bid.sellerId = :sellerId', { sellerId })
//   .getExists();
//   if(alreadyBid)
//   {
//     return new ResultDto([],"You have already bidded on this project",true);
//   }
// // a seller can bid on multiple projects at most 10 times for free after that 50 riyal will be charged
// // after the new month start the bid count will get reset to 0 so that if a seller bids 6 times on the platform for the 
// // month of january and thinks that he got 4 more remaining which he can use on february that is not possible because
// // for each month only 10 bids allowed on free after that a tax amount (fixed for now 50 riyal) will be charged
// const now = new Date();

// // Start of current month (e.g., Oct 1, 2025, 00:00:00)
// const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
// // End of current month (e.g., Oct 31, 2025, 23:59:59)
// const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

// let taxAmount = 0;
// const bidCount = await this.bidRepo.count({
//   where: {
//     seller: { id: sellerId },
//     createdAt: Between(monthStart, monthEnd)
//   },
// });
//   if(bidCount>10)
//   {
//     taxAmount = 1000;
//   }
//   // taxAmount can be added later in this
//   const bid = this.bidRepo.create({
//     proposalText: dto.proposalText,
//     bidAmount: dto.bidAmount,
//     timeline: dto.timeline,
//     attachment: dto.attachment ?? null,
//     status: dto.status ?? BidStatus.PENDING,
//     seller: seller,
//     project: project,
//   });

//   await this.bidRepo.save(bid);

//   return new ResultDto(bid, 'Bid placed successfully', true);
// }
async createBid(sellerId: number, dto: postBidDTO): Promise<ResultDto<Bid|any>|any> {
  try {
     const seller = await this.userRepo.findOne({ where: { id: sellerId } });
  if (!seller) throw new BadRequestException('Seller not found.');

  const project = await this.projectRepo.findOne({ where: { id: dto.ProjectId } });
  if (!project || project.status !== 'Published') {
    throw new BadRequestException('You can only bid on published projects.');
  }

  // Check if already bid on this project
  const alreadyBid = await this.bidRepo
    .createQueryBuilder('bid')
    .where('bid.projectId = :projectId', { projectId: dto.ProjectId })
    .andWhere('bid.sellerId = :sellerId', { sellerId })
    .getExists();

  if (alreadyBid) {
    throw new BadRequestException('You have already placed a bid on this project.');
  }

  // --- Monthly Bid Limit Logic ---
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const monthlyBidCount = await this.bidRepo.count({
    where: {
      seller: { id: sellerId },
      createdAt: Between(monthStart, monthEnd),
    },
  });

  // Define tax logic
  const FREE_BIDS_LIMIT = 10;
  const TAX_AMOUNT = 50; // riyals per bid after 10

  let isTaxed = false;
  let taxApplied = 0;
  let monthlyBidNumber = monthlyBidCount + 1;

  if (monthlyBidCount >= FREE_BIDS_LIMIT) {
    isTaxed = true;
    taxApplied = TAX_AMOUNT;
  }
if(dto.bidAmount<=0)
  {
    throw new Error("bid amount cannot be 0 or less"); 
  }
  // Create bid
  const bid = this.bidRepo.create({
    proposalText: dto.proposalText,
    bidAmount: dto.bidAmount,
    timeline: dto.timeline,
    attachment: dto.attachment ?? null,
    status: BidStatus.PENDING, // default when bid made status would be pending
    seller,
    project,
    isTaxed,
    taxApplied,
    monthlyBidCount: monthlyBidNumber,
  });

  await this.bidRepo.save(bid);

  const message = isTaxed
    ? `Bid placed successfully. A tax of ${TAX_AMOUNT} riyals was applied.`
    : 'Bid placed successfully.';

  return new ResultDto(bid, message, true);
  } 
  catch (error) {
  if (error instanceof HttpException) throw error;
  throw new InternalServerErrorException(error.message);
}

 
}


async getMonthlyBidSummary(sellerId: number): Promise<ResultDto<any>> {
  const seller = await this.userRepo.findOne({ where: { id: sellerId } });
  if (!seller) throw new BadRequestException('Seller not found.');

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const FREE_BIDS_LIMIT = 10;
  const TAX_AMOUNT = 50;

  const bids = await this.bidRepo.find({
    where: {
      seller: { id: sellerId },
      createdAt: Between(monthStart, monthEnd),
    },
  });

  const totalBids = bids.length;
  const freeBidsUsed = Math.min(totalBids, FREE_BIDS_LIMIT);
  const remainingFreeBids = Math.max(0, FREE_BIDS_LIMIT - totalBids);
  const taxedBids = bids.filter((b) => b.isTaxed).length;
  const totalTaxPaid = bids.reduce((sum, b) => sum + (b.taxApplied || 0), 0);

  const summary = {
    sellerId,
    month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
    totalBids,
    freeBidsUsed,
    remainingFreeBids,
    taxedBids,
    totalTaxPaid,
    nextTaxBidCost: TAX_AMOUNT,
    resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1), // next month start
  };

  return new ResultDto(summary, 'Monthly bid summary retrieved successfully.', true);
}


async getBidsPaginated(
  userRole: string,
  userId?: number,
  filterBy?: string,
  filterKey?: string, // e.g., 'proposalText', 'status', 'bidAmount'
  page: number = 1,
  limit: number = 10,
): Promise<
  ResultDto<{
    bids: BidResponseDTO[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
    };
  }>
> {
  try {
    const skip = (page - 1) * limit;

    const qb = this.bidRepo
      .createQueryBuilder('bid')
      .leftJoinAndSelect('bid.project', 'project')
      .leftJoinAndSelect('bid.seller', 'seller')
      .leftJoinAndSelect('project.user', 'buyer');

       // retriveing only isWithdrawn false
    qb.andWhere('bid.isWithdrawn = false');

    // 🧭 Role-based filtering
    if (userRole === RoleType.SELLER && userId) {
      qb.where('seller.id = :userId', { userId });
    } else if (userRole === RoleType.BUYER && userId) {
      qb.where('buyer.id = :userId', { userId });
    }

    // 🔍 Apply dynamic filters
    if (filterBy && filterKey) {
  if (filterKey === 'status') {
    qb.andWhere(`bid.${filterKey} = :filterBy`, { filterBy });
  } else {
    qb.andWhere(`bid.${filterKey} ILIKE :filterBy`, {
      filterBy: `%${filterBy}%`,
    });
  }
}

   


    // 📊 Count before pagination
    const totalCount = await qb.getCount();

    // 📄 Pagination & sorting
    qb.orderBy('bid.id', 'DESC').skip(skip).take(limit);

    const bids = await qb.getMany();
    const totalPages = Math.ceil(totalCount / limit);

    // 🧱 Map to DTO
    const bidResponses = bids.map(
      (b) =>
        new BidResponseDTO({
          id: b.id,
          proposalText: b.proposalText,
          bidAmount: b.bidAmount,
          timeline: b.timeline,
          status: b.status,
          attachment: b.attachment,
          createdAt: b.createdAt,
          ...(userRole === RoleType.BUYER && b.seller
            ? {
                sellerInfo: {
                  id: b.seller.id,
                  name: b.seller.firstName + ' ' + b.seller.lastName,
                  email: b.seller.email,
                },
              }
            : {}),
          ...(userRole === RoleType.SELLER && b.project
            ? {
                projectInfo: {
                  id: b.project.id,
                  title: b.project.title,
                  budgetRange: b.project.budgetRange,
                  status: b.project.status,
                },
              }
            : {}),
        }),
    );

    return new ResultDto(
      {
        bids: bidResponses,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
        },
      },
      `Bids retrieved successfully (page ${page} of ${totalPages})`,
      true,
    );
  } catch (error) {
    throw new InternalServerErrorException(error.message);
  }
}





async getAllBids(userId: number, userRole: string): Promise<ResultDto<BidResponseDTO[]>> {
  try {
    let bids: Bid[] = [];

    if (userRole === RoleType.SELLER) {
      // Seller can see all bids they have made
      bids = await this.bidRepo.find({
        where: { seller: { id: userId },isWithdrawn:false },
         relations: ['project', 'project.user', 'seller'],
      });
    } else if (userRole === RoleType.BUYER) {
      // Buyer can see all bids placed on their projects
      bids = await this.bidRepo.find({
        where: { project: { user: { id: userId } } },
         relations: ['project', 'project.user', 'seller'],
      });
    }

    const responseBids = bids.map(
      (b) =>
        new BidResponseDTO({
          id: b.id,
          projectTitle: b.project.title,
          buyerName: `${b.project.user.firstName} ${b.project.user.lastName}`,
           sellerName: `${b.seller.firstName} ${b.seller.lastName}`,
          proposalText: b.proposalText,
          bidAmount: b.bidAmount,
          timeline: b.timeline,
          attachment: b.attachment,
          status: b.status,
        }),
    );

    return new ResultDto(responseBids, 'Bids fetched successfully', true);
  } catch (error) {
    throw new InternalServerErrorException(error.message);
  }
}

async getBidById(
  id: number,
  userId: number,
  userRole: string,
): Promise<ResultDto<BidResponseDTO|any>> {
  try {
    let bid: Bid | null = null;

    if (userRole === RoleType.SELLER) {
      bid = await this.bidRepo.findOne({
        where: { id, seller: { id: userId },isWithdrawn:false },
           relations: ['project', 'project.user', 'seller'],
      });
    } else if (userRole === RoleType.BUYER) {
      bid = await this.bidRepo.findOne({
        where: { id, project: { user: { id: userId } } ,isWithdrawn:false},
          relations: ['project', 'project.user', 'seller'],
      });
    }

    if (!bid) {
      return new ResultDto([],"Bid Not Found",true);
    }

    const responseBid = new BidResponseDTO({
      id: bid.id,
      projectTitle: bid.project.title,
      buyerName: `${bid.project.user.firstName} ${bid.project.user.lastName}`,
      // sellerName: `${bid.seller.firstName} ${bid.seller.lastName}`,
      proposalText: bid.proposalText,
      bidAmount: bid.bidAmount,
      timeline: bid.timeline,
      attachment: bid.attachment,
      status: bid.status,
    });

    return new ResultDto(responseBid, 'Bid fetched successfully', true);
  } catch (error) {
    if (error instanceof NotFoundException) throw error;
    throw new InternalServerErrorException(error.message);
  }
}


// Project bid for buyer

async getBidsForProject(
  projectId: number,
  userId: number,
  userRole: string,
): Promise<ResultDto<ProjectWithBidsDTO>> {
  try {
    // only buyers can use this
    if (userRole !== RoleType.BUYER) {
      throw new ForbiddenException('Only buyers can view project bids');
    }

    // fetch project along with its bids and seller details
    const project = await this.projectRepo.findOne({
      where: { id: projectId, user: { id: userId } },
      relations: [
        'bids',
        'bids.seller',
        'bids.seller.company',
        'bids.seller.contact',
      ],
    });

    if (!project) {
      throw new NotFoundException('Project not found or not owned by buyer');
    }

    const projectWithBids = new ProjectWithBidsDTO({
      id: project.id,
      projectTitle: project.title,
      outline: project.outline,
      requirements: project.requirements,
      budgetRange: project.budgetRange,
      timeline: project.timeline,
      skillsRequired: project.skillsRequired,
      attachment: project.attachment,
      status: project.status,
      createdAt: project.createdAt,
      bids: project.bids
        .filter((b) => !b.isWithdrawn)
        .map(
          (b) =>
            new SellerBidDTO({
              id: b.id,
              sellerId: b.seller.id,
              sellerName: `${b.seller.firstName} ${b.seller.lastName}`,
              bidAmount: b.bidAmount,
              timeline: b.timeline,
              proposalText: b.proposalText,
              attachment: b.attachment,
              status: b.status,
            }),
        ),
    });

    return new ResultDto(projectWithBids, 'Project bids fetched successfully', true);
  } catch (error) {
    throw new InternalServerErrorException(error.message);
  }
}


async acceptBid(id: number, userId: number, userRole: string) {
  if (userRole !== RoleType.BUYER)
    throw new ForbiddenException('Only buyers can accept bids');

  const bid = await this.bidRepo.findOne({
    where: { id },
    relations: ['project', 'project.bids', 'project.user'],
  });

  if (!bid) throw new NotFoundException('Bid not found');
  if (bid.project.user.id !== userId)
    throw new ForbiddenException('Not your project');

  const alreadyAccepted = bid.project.bids.find(
    (b) => b.status === BidStatus.ACCEPTED,
  );

  if (alreadyAccepted && alreadyAccepted.id !== id) {
    throw new BadRequestException('A bid has already been accepted for this project');
  }

  // Accept this one and reject others
  for (const b of bid.project.bids) {
    b.status = b.id === id ? BidStatus.ACCEPTED : BidStatus.REJECTED;
    await this.bidRepo.save(b);
  }

  return new ResultDto(null, 'Bid accepted successfully', true);
}

async rejectBid(id: number, userId: number, userRole: string) {
  if (userRole !== RoleType.BUYER)
    throw new ForbiddenException('Only buyers can reject bids');

  const bid = await this.bidRepo.findOne({
    where: { id },
    relations: ['project', 'project.user'],
  });

  if (!bid) throw new NotFoundException('Bid not found');
  if (bid.project.user.id !== userId)
    throw new ForbiddenException('Not your project');

  bid.status = BidStatus.REJECTED;
  await this.bidRepo.save(bid);

  return new ResultDto(null, 'Bid rejected successfully', true);
}







async withdrawBid(
  id: number,
  userId: number,
  userRole: string,
): Promise<ResultDto<any>> {
  try {
    if (userRole !== RoleType.SELLER) {
      throw new ForbiddenException('Only sellers can withdraw bids');
    }

    const bid = await this.bidRepo.findOne({
      where: { id, seller: { id: userId } },
      relations: ['project'],
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    if (bid.project.status === BidStatus.AWARDED.toString()) {
      throw new BadRequestException('This bid cannot be withdrawn after award.');
    }

    bid.status = BidStatus.WITHDRAWN;
    bid.isWithdrawn = true;
    await this.bidRepo.save(bid);

    return new ResultDto(bid, 'Bid has been withdrawn successfully.', true);
  } catch (error) {
    if (
      error instanceof ForbiddenException ||
      error instanceof NotFoundException ||
      error instanceof BadRequestException
    )
      throw error;
    throw new InternalServerErrorException(error.message);
  }
}



  // 10 bid per month check
  // const currentMonthBids = await this.bidRepo.count({
  //   where: {
  //     seller: { id: sellerId },
  //     createdAt: Between(startOfMonth(new Date()), endOfMonth(new Date())),
  //   },
  // });

  // if (currentMonthBids >= 10) {
  //   throw new BadRequestException('You have reached your 10 bids per month limit.');
  // }

// async getMyBids(sellerId: string, pagination: PaginationDto): Promise<ResultDto<Bid[]>> {
//   const [bids, count] = await this.bidRepo.findAndCount({
//     where: { seller: { id: sellerId } },
//     relations: ['project', 'project.user'],
//     take: pagination.limit,
//     skip: pagination.offset,
//     order: { createdAt: 'DESC' },
//   });
//   return new ResultDto({ bids, total: count }, 'My bids fetched successfully', true);
// }
// async updateBid(bidId: string, sellerId: string, dto: UpdateBidDto): Promise<ResultDto<Bid>> {
//   const bid = await this.bidRepo.findOne({ where: { id: bidId }, relations: ['seller'] });

//   if (!bid) throw new NotFoundException('Bid not found');
//   if (bid.seller.id !== sellerId) throw new ForbiddenException('Not your bid');
//   if (bid.status !== 'Pending') throw new BadRequestException('This bid cannot be edited once project is awarded.');

//   Object.assign(bid, dto);
//   await this.bidRepo.save(bid);

//   return new ResultDto(bid, 'Bid updated successfully', true);
// }
// async withdrawBid(bidId: string, sellerId: string): Promise<ResultDto<Bid>> {
//   const bid = await this.bidRepo.findOne({ where: { id: bidId }, relations: ['seller', 'project'] });

//   if (!bid) throw new NotFoundException('Bid not found');
//   if (bid.seller.id !== sellerId) throw new ForbiddenException('Not your bid');
//   if (bid.status !== 'Pending') throw new BadRequestException('This bid cannot be withdrawn after award.');

//   bid.status = 'Withdrawn';
//   await this.bidRepo.save(bid);

//   return new ResultDto(bid, 'Bid withdrawn successfully', true);
// }

}
