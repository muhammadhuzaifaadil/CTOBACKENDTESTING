import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '../../User/Entities/User.entity';
import { Company } from 'src/Company/Entities/Company.entity';
import { Contact } from 'src/Contact/Entities/Contact.entity';
import { Roles, RoleType } from 'src/Roles/Entities/Role.entity';
import { ResultDto } from 'src/Common/Utility/ResultModel';
import { updateProfileDTO } from '../DTOs/updateprofile.dto';
import { BuyerProfile } from 'src/BuyerProfile/Entity/BuyerProfile.entity';
import { SellerProfile } from 'src/Seller/Entity/SellerProfile.entity';
import { UserResponseDTO } from '../DTOs/userResponse.dto';
import { mapperService } from '../../Common/Utility/mapper.dto';

@Injectable()
export class UserService {



    constructor(
    private readonly mapper:mapperService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Company) private readonly companyRepo: Repository<Company>,
    @InjectRepository(Contact) private readonly contactRepo: Repository<Contact>,
    @InjectRepository(Roles) private readonly roleRepo: Repository<Roles>,
    @InjectRepository(BuyerProfile) private readonly buyerRepo: Repository<BuyerProfile>,
    @InjectRepository(SellerProfile) private readonly sellerRepo: Repository<SellerProfile>,
    
    ){}

  // async updateUser(id: number, updateUserDto: updateProfileDTO):Promise<ResultDto<User>>
  //   {
  //         const existingUser = await this.userRepo.findOne({ where: { id } });
  //          if (!existingUser) {
  //   throw new NotFoundException(`User with ID ${id} not found`);
  // }

  //   Object.assign(existingUser, { 
  //   ...updateUserDto, 
  //   roleId: undefined // prevent this from interfering with TypeORM relations
  // });

  //   const updated = await this.userRepo.save(existingUser);


  //       return new ResultDto(updated, 'User updated successfully', true);
  //   }


 async updateUser(id: number, dto: updateProfileDTO): Promise<ResultDto<User>> {
    // 🔹 Step 1: Fetch user with relations
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    // let buyerProfile:BuyerProfile|null=null;
    // let sellerProfile:SellerProfile|null=null;
    let contact:Contact|null = null;
    let company:Company|null = null;
    if(user?.role?.name===RoleType.BUYER)
    {
      const buyerProfile = await this.buyerRepo.findOne({
        where:{user},
        relations:['contact','company']
      }); 
      contact = buyerProfile?.contact ?? null;
    company = buyerProfile?.company ?? null;
    }
    else if(user?.role.name===RoleType.SELLER)
    {
      const sellerProfile = await this.sellerRepo.findOne({
        where:{user},
        relations:['contact','company']
      });
      contact = sellerProfile?.contact ?? null;
    company = sellerProfile?.company ?? null;
    }
    // 🔹 Step 2: Update only provided user fields
     Object.assign(user, {
    firstName: dto.FirstName ?? user.firstName,
    middleName: dto.MiddleName ?? user.middleName,
    lastName: dto.LastName ?? user.lastName,
  });

    // 🔹 Step 3: Update related contact (if it exists)
    if (contact) {
    Object.assign(contact, {
      phoneCode: dto.PhoneCode ?? contact.phoneCode,
      phoneNumber: dto.PhoneNumber ?? contact.phoneNumber,
      address: dto.Address ?? contact.address,
      city: dto.City ?? contact.city,
      country: dto.Country ?? contact.country,
    });
    await this.contactRepo.save(contact);
  }

    // 🔹 Step 4: Update related company (if it exists)
    if (company) {
    Object.assign(company, {
      name: dto.CompanyName ?? company.name,
      websiteUrl: dto.websiteUrl ?? company.websiteUrl,
      businessCategory: dto.businessCategory ?? company.businessCategory,
      companyDetail:
        dto.experience !== undefined
          ? `Experience: ${dto.experience}`
          : company.companyDetail,
    });
    await this.companyRepo.save(company);
  }

    // 🔹 Step 5: Save updated user
    const updatedUser = await this.userRepo.save(user);

    return new ResultDto(updatedUser, 'User updated successfully', true);
  }


  // 🟡 GET ALL USERS (with profiles based on role)
 async getAllUsers(): Promise<ResultDto<UserResponseDTO[]>> {
  try {
    // Fetch only required relations
    const users = await this.userRepo.find({
      relations: ['role', 'contact', 'company'],
    });

    // Map to DTOs (no sensitive fields, no direct entity return)
    const responseUsers = await Promise.all(
      users.map(async (user) => {
        let profile: BuyerProfile | SellerProfile | null = null;

        if (user.role?.name === RoleType.BUYER) {
          profile = await this.buyerRepo.findOne({
            where: { user: { id: user.id } },
            relations: ['contact', 'company'],
          });
        } else if (user.role?.name === RoleType.SELLER) {
          profile = await this.sellerRepo.findOne({
            where: { user: { id: user.id } },
            relations: ['contact', 'company'],
          });
        }

        // Use mapper to safely map entity to DTO
        return new UserResponseDTO(this.mapper.mapToUserDTO(user, profile));
      }),
    );

    return new ResultDto(responseUsers, 'All users fetched successfully', true);
  } catch (error) {
    throw new InternalServerErrorException(error.message);
  }
}



  // 🔵 GET USER BY ID (with role-based profile)
async getUserById(id: number): Promise<ResultDto<UserResponseDTO>> {
  try {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['role', 'contact', 'company'],
    });

    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    let profile: BuyerProfile | SellerProfile | null = null;

    if (user.role?.name === RoleType.BUYER) {
      profile = await this.buyerRepo.findOne({
        where: { user: { id } },
        relations: ['contact', 'company'],
      });
    } else if (user.role?.name === RoleType.SELLER) {
      profile = await this.sellerRepo.findOne({
        where: { user: { id } },
        relations: ['contact', 'company'],
      });
    }

    // 🧩 Use mapper to shape final safe DTO
    const mappedUser = this.mapper.mapToUserDTO(user, profile);
    const result = new UserResponseDTO(mappedUser);

    return new ResultDto(result, 'User fetched successfully', true);
  } catch (error) {
    throw new InternalServerErrorException(error.message);
  }
}



  // 🟢 GET USERS WITH FILTERING + PAGINATION
 async getUsersPaginated(
  filterBy?: string,
  filterKey?: string,
  page: number = 1,
  limit: number = 10,
): Promise<ResultDto<any>> {
  try {
    const skip = (page - 1) * limit;
    const qb = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.contact', 'contact')
      .leftJoinAndSelect('user.company', 'company');

    if (filterBy && filterKey) {
      qb.where(`user.${filterKey} ILIKE :filterBy`, {
        filterBy: `%${filterBy}%`,
      });
    }

    const totalCount = await qb.getCount();
    qb.orderBy('user.id', 'ASC').skip(skip).take(limit);

    const users = await qb.getMany();

    // 🧩 Map all users using Mapper to hide password/refreshToken
    const responseUsers = await Promise.all(
      users.map(async (user) => {
        let profile: BuyerProfile | SellerProfile | null = null;

        if (user.role?.name === RoleType.BUYER) {
          profile = await this.buyerRepo.findOne({
            where: { user: { id: user.id } },
            relations: ['contact', 'company'],
          });
        } else if (user.role?.name === RoleType.SELLER) {
          profile = await this.sellerRepo.findOne({
            where: { user: { id: user.id } },
            relations: ['contact', 'company'],
          });
        }

        const mapped = this.mapper.mapToUserDTO(user, profile);
        return new UserResponseDTO(mapped);
      }),
    );

    const totalPages = Math.ceil(totalCount / limit);

    return new ResultDto(
      {
        users: responseUsers,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
        },
      },
      `Users retrieved successfully (page ${page} of ${totalPages})`,
      true,
    );
  } catch (error) {
    throw new InternalServerErrorException(error.message);
  }
}



}