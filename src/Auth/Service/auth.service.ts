import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../User/Entities/User.entity';
import { Roles, RoleType } from '../../Roles/Entities/Role.entity';
import { Company } from '../../Company/Entities/Company.entity';
import { Contact } from '../../Contact/Entities/Contact.entity';
import { BuyerProfile } from '../../BuyerProfile/Entity/BuyerProfile.entity';
import { SellerProfile } from '../../Seller/Entity/SellerProfile.entity';
import { RegisterDto } from '../DTOs/register-user.dto';
import { LoginDto } from '../DTOs/login-user.dto';
import { ResponseUserDto } from '../DTOs/response-user.dto';
import { JwtService } from "@nestjs/jwt";
import { randomBytes } from 'crypto';
import { ForgotPasswordDto, ResetPasswordDto } from '../DTOs/forgotpassword.dto';
import { EmailService } from 'src/Common/Utility/email.service';
import { UpdatePasswordDto } from '../DTOs/update-userpass.dto';
import { UploadService } from 'src/Uploads/services/uploads.services';
import { Upload } from 'src/Uploads/Entities/upload.entity';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Roles) private readonly roleRepo: Repository<Roles>,
    @InjectRepository(Contact) private readonly contactRepo: Repository<Contact>,
    @InjectRepository(Company) private readonly companyRepo: Repository<Company>,
    @InjectRepository(BuyerProfile)
    private readonly buyerRepo: Repository<BuyerProfile>,
    @InjectRepository(SellerProfile)
    private readonly sellerRepo: Repository<SellerProfile>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly uploadService: UploadService,
  ) {}

//   async register(dto: RegisterDto): Promise<User> {
//     // ✅ Check if user already exists
//     const existingUser = await this.userRepo.findOne({
//       where: { email: dto.user.email },
//     });
//     if (existingUser) {
//       throw new ConflictException('Email is already registered');
//     }

//     // ✅ Verify passwords match
//     if (dto.user.password !== dto.user.confirmPassword) {
//       throw new BadRequestException('Passwords do not match');
//     }

//     // ✅ Hash password
//     const hashedPassword = await bcrypt.hash(dto.user.password, 10);

//     // ✅ Get role from DB
//     const role = await this.roleRepo.findOne({
//       where: { name: dto.role },
//     });
//     if (!role) {
//       throw new BadRequestException(`Role '${dto.role}' not found`);
//     }

//     // ✅ Create user
//     const user = this.userRepo.create({
//       firstName: dto.user.firstName,
//       middleName: dto.user?.middleName,
//       lastName: dto.user.lastName,
//       email: dto.user.email,
//       password: hashedPassword,
//       role,
//     });
//     const savedUser = await this.userRepo.save(user);

//     // ✅ Create and save contact
//     const contact = this.contactRepo.create(dto.contact);
//     const savedContact = await this.contactRepo.save(contact);

//     // ✅ Create company if provided (optional for buyers)
//     let savedCompany: Company | null = null;
//     if (dto.company) {
//       const company = this.companyRepo.create(dto.company);
//       savedCompany = await this.companyRepo.save(company);
//     }

//     // ✅ Create profile based on role
//     if (dto.role === RoleType.BUYER) {
//       const buyerProfile = this.buyerRepo.create({
//         user: savedUser,
//         contact: savedContact,
//         company: savedCompany || undefined,
//         acceptedTerms: dto.acceptedTerms,
//       });
//       await this.buyerRepo.save(buyerProfile);
//     } else if (dto.role === RoleType.SELLER) {
      
//       const sellerProfile = this.sellerRepo.create({
//         user: savedUser,
//         contact: savedContact,
//         company: savedCompany || undefined,
//         acceptedTerms: dto.acceptedTerms,
//       });
//       await this.sellerRepo.save(sellerProfile);
//     }

//     // ✅ Clean up sensitive data
// delete (savedUser as any).password;

//     return savedUser;
//   }

  // auth.service.ts
// async login(dto: LoginDto): Promise<{ accessToken: string; user: any }> {
//   const user = await this.userRepo.findOne({
//     where: { email: dto.email },
//     relations: ['role'],
//   });

//   if (!user || !(await bcrypt.compare(dto.password, user.password))) {
//     throw new UnauthorizedException('Invalid credentials');
//   }

//   const payload = { sub: user.id, email: user.email, role: user.role.name };
//   const accessToken = await this.jwtService.signAsync(payload);

//   return {
//     accessToken,
//     user: {
//       id: user.id,
//       email: user.email,
//       role: user.role.name,
//       firstName: (user as any).firstName,
//       lastName: (user as any).lastName,
//     },
//   };
// }

//pass reset using jwt and email service(not used)
// async forgotPassword(dto: ForgotPasswordDto): Promise<string> {
//     const user = await this.userRepo.findOne({ where: { email: dto.email } });
//     if (!user) throw new NotFoundException('User not found');

//     // ✅ Generate secure random token
//     const token = randomBytes(32).toString('hex');
//     user.resetPasswordToken = token;
//     user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
//     await this.userRepo.save(user);

//     // ✅ Create frontend reset link
//     const resetLink = `https://yourfrontend.com/reset-password?token=${token}`;

//     // ✅ Send email using your EmailService
//     await this.emailService.sendMail(
//       user.email,
//       'Password Reset Request',
//       `
//         <p>Hello ${user.email},</p>
//         <p>You requested to reset your password.</p>
//         <p>Please click the link below to reset it:</p>
//         <p><a href="${resetLink}" target="_blank">${resetLink}</a></p>
//         <p>This link will expire in 1 hour.</p>
//       `
//     );

//     return `Password reset link has been sent to your email=${token} remove after testing`;
//   }
async register(dto: RegisterDto, files?: Record<string, Express.Multer.File[]>): Promise<User> {
  // ✅ 1. Check for existing user
  const existingUser = await this.userRepo.findOne({
    where: { email: dto.user.email },
  });
  if (existingUser) throw new ConflictException('Email is already registered');

  // ✅ 2. Verify password match
  if (dto.user.password !== dto.user.confirmPassword) {
    throw new BadRequestException('Passwords do not match');
  }

  // ✅ 3. Hash password
  const hashedPassword = await bcrypt.hash(dto.user.password, 10);

  // ✅ 4. Get role
  const role = await this.roleRepo.findOne({ where: { name: dto.role } });
  if (!role) throw new BadRequestException(`Role '${dto.role}' not found`);

  // ✅ 5. Create User
  const user = this.userRepo.create({
    firstName: dto.user.firstName,
    middleName: dto.user?.middleName,
    lastName: dto.user.lastName,
    email: dto.user.email,
    password: hashedPassword,
    role,
  });
  const savedUser = await this.userRepo.save(user);

  // ✅ 6. Create Contact
  const contact = this.contactRepo.create(dto.contact);
  const savedContact = await this.contactRepo.save(contact);

  // ✅ 7. Handle File Metadata (for SELLER only)
  let savedCompany: Company | null = null;
  if (dto.role === RoleType.SELLER) {
    let logoMeta:Upload|null = null;
    let licenseMeta:Upload|null = null;
    let portfolioMeta:Upload|null = null;

    if (files?.companyLogo?.[0])
      logoMeta = await this.uploadService.saveFileMeta(files.companyLogo[0], savedUser.id);
    if (files?.businessLicense?.[0])
      licenseMeta = await this.uploadService.saveFileMeta(files.businessLicense[0], savedUser.id);
    if (files?.portfolio?.[0])
      portfolioMeta = await this.uploadService.saveFileMeta(files.portfolio[0], savedUser.id);

    const company = this.companyRepo.create({
      ...dto.company,
      logoUrl: logoMeta?.filePath,
      businessLicenseUrl: licenseMeta?.filePath,
      portfolioUrl: portfolioMeta?.filePath,
    });

    savedCompany = await this.companyRepo.save(company);
  } else if (dto.role === RoleType.BUYER && dto.company) {
    // buyer with optional company
    const company = this.companyRepo.create(dto.company);
    savedCompany = await this.companyRepo.save(company);
  }

  // ✅ 8. Create Buyer/Seller Profile
  if (dto.role === RoleType.BUYER) {
    const buyerProfile = this.buyerRepo.create({
      user: savedUser,
      contact: savedContact,
      company: savedCompany || undefined,
      acceptedTerms: dto.acceptedTerms,
    });
    await this.buyerRepo.save(buyerProfile);
  } else if (dto.role === RoleType.SELLER) {
    const sellerProfile = this.sellerRepo.create({
      user: savedUser,
      contact: savedContact,
      company: savedCompany || undefined,
      acceptedTerms: dto.acceptedTerms,
    });
    await this.sellerRepo.save(sellerProfile);
  }

  // ✅ 9. Remove sensitive data before returning
  delete (savedUser as any).password;

  return savedUser;
}


  async resetPassword(dto: ResetPasswordDto): Promise<string> {
    const user = await this.userRepo.findOne({ where: { resetPasswordToken: dto.token } });
    if (!user || user.resetPasswordExpires < new Date()) {
      throw new UnauthorizedException('Token is invalid or expired');
    }

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    user.password = hashed;
    user.resetPasswordToken = '';
    user.resetPasswordExpires = new Date(0);
    await this.userRepo.save(user);

    return 'Password reset successful';
  }


async updatePassword(dto: UpdatePasswordDto,userId:number): Promise<string> {
  // ✅ Find user by email
  
  const user = await this.userRepo.findOne({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // ✅ Check if current password is correct
  const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
  if (!isMatch) {
    throw new UnauthorizedException('Current password is incorrect');
  }

  // ✅ Check if new password and confirm password match
  if (dto.newPassword !== dto.confirmNewPassword) {
    throw new BadRequestException('New password and confirmation do not match');
  }

  // ✅ Prevent reusing the same password
  const isSameAsOld = await bcrypt.compare(dto.newPassword, user.password);
  if (isSameAsOld) {
    throw new BadRequestException('New password cannot be the same as current password');
  }

  // ✅ Hash and save new password
  const hashed = await bcrypt.hash(dto.newPassword, 10);
  user.password = hashed;

  await this.userRepo.save(user);

  return 'Password updated successfully';
}
// ✅ REFRESH TOKEN — issue new access token
  async refreshToken(userId: number, token: string) {
    const user = await this.userRepo.findOne({
       where: { id: userId },
      relations: ['role'] });
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('Access denied');

    const isValid = await bcrypt.compare(token, user.refreshToken);
    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    const payload = { sub: user.id, email: user.email, role: user.role.name };
    const newAccessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });

    return { accessToken: newAccessToken };
  }

  // ✅ LOGIN — issue short-lived access token and long-lived refresh token
  async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      relations: ['role'],
    });

    let sellerCompanyName: string | undefined = undefined;
    if (user?.role?.name === RoleType.SELLER) {
      const seller = await this.sellerRepo.findOne({
        where: { user: { id: user?.id } },
        relations: ['company']
      });
      sellerCompanyName = seller?.company?.name;
    }

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role.name };

    // short-lived access token (15 min)
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });

    // long-lived refresh token (7 days)
    const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });

    // save hashed refresh token to DB for logout validation
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.save(user);

    const response: any = {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role.name,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    };
    if (sellerCompanyName) {
      response.user.companyName = sellerCompanyName;
    }
    return response;
  }



// ✅ LOGOUT — clear refresh token from DB
 async logout(userId: number) {
  await this.userRepo.update({ id: userId }, { refreshToken: '' });
  return { message: 'Logged out successfully' };
}

}
