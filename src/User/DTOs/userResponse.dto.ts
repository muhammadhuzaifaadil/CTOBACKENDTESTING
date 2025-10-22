import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';


export class ContactDTO {
  @ApiProperty()
  @Expose() id: number;
  @ApiProperty()
  @Expose() phoneCode: string;
  @Expose() phoneNumber: string;
  @Expose() address?: string;
  @ApiProperty()
  @Expose() city?: string;
  @ApiProperty()
  @Expose() country?: string;

  constructor(partial: Partial<ContactDTO>) {
    Object.assign(this, partial);
  }
}

export class CompanyDTO {
 @ApiProperty()
  @Expose() id: number;
  @ApiProperty()
  @Expose() name: string;
  @ApiProperty()
  @Expose() logoUrl?: string;
  @ApiProperty()
  @Expose() businessCategory?: string;
  @ApiProperty()
  @Expose() websiteUrl?: string;

  constructor(partial: Partial<CompanyDTO>) {
    Object.assign(this, partial);
  }
}

export class RoleDTO {
 @ApiProperty()
  @Expose() id: number;
 @ApiProperty()
  @Expose() name: string;

  constructor(partial: Partial<RoleDTO>) {
    Object.assign(this, partial);
  }
}

export class ProfileDTO {
 @ApiProperty()
  @Expose() id: number;
@ApiProperty()

  @Expose()
  @Type(() => ContactDTO)
  contact?: ContactDTO;
@ApiProperty()

  @Expose()
  @Type(() => CompanyDTO)
  company?: CompanyDTO;
@ApiProperty()

  @Expose()
  acceptedTerms: boolean;

  constructor(partial: Partial<ProfileDTO>) {
    Object.assign(this, partial);
  }
}

export class UserResponseDTO {
  @ApiProperty()
  @Expose() id: number;
  @ApiProperty()
  @Expose() firstName: string;
  @ApiProperty()
  @Expose() middleName?: string;
  @ApiProperty()
  @Expose() lastName: string;
  @ApiProperty()
  @Expose() email: string;
  @ApiProperty()
  @Expose()
  @Type(() => RoleDTO)
  role: RoleDTO;
  @ApiProperty()
  @Expose()
  @Type(() => ContactDTO)
  contact?: ContactDTO;
  @ApiProperty()
  @Expose()
  @Type(() => CompanyDTO)
  company?: CompanyDTO;
  @ApiProperty()
  @Expose()
  @Type(() => ProfileDTO)
  profile?: ProfileDTO|null;

  constructor(partial: Partial<UserResponseDTO>) {
    Object.assign(this, partial);
  }
}
