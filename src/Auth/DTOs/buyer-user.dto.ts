import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UserInfoDto {
  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @MinLength(6)
  password: string;
}

export class ContactInfoDto {
  @ApiProperty()
  @IsNotEmpty()
  phoneCode: string;

  @ApiProperty()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ required: false })
  @IsOptional()
  address?: string;

  @ApiProperty()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsNotEmpty()
  country: string;
}

export class CompanyInfoDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  websiteUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  businessCategory?: string;
}

export class BuyerRegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  role: 'buyer' | 'seller'; // role type from frontend

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
