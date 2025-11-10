import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MinLength,
  ValidateNested,
  IsString,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RoleType } from 'src/Roles/Entities/Role.entity';

// ✅ USER INFO DTO
export class UserInfoDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @MinLength(6)
  confirmPassword: string;
}

// ✅ CONTACT DTO (same for buyer & seller)
export class ContactInfoDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phoneCode: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

   @ApiProperty()
  @IsOptional()
  @IsString()
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  country: string;
}

// ✅ COMPANY DTO (optional for buyer)
export class CompanyInfoDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  crNumber?: string; // seller only

  @ApiProperty({ required: false, description: 'URL to company logo file (optional)' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  businessCategory?: string; // seller only

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  experience?: number; // seller only

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  websiteUrl?: string; // both

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  businessLicenseUrl?: string; // seller only

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  portfolioUrl?: string; // seller only
}

// ✅ MAIN REGISTER DTO
export class RegisterDto {
  @ApiProperty({ enum: RoleType })
  @IsEnum(RoleType)
  role: RoleType;

  @ApiProperty({ type: () => UserInfoDto })
  @ValidateNested()
  @Type(() => UserInfoDto)
  user: UserInfoDto;

  @ApiProperty({ type: () => ContactInfoDto })
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contact: ContactInfoDto;

  @ApiProperty({ type: () => CompanyInfoDto, required: false })
  @ValidateNested()
  @Type(() => CompanyInfoDto)
  @IsOptional()
  company?: CompanyInfoDto;

  @ApiProperty()
  @IsBoolean()
  acceptedTerms: boolean;
}
