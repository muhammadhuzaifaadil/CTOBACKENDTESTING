import { ApiProperty } from "@nestjs/swagger";
import { Expose } from 'class-transformer';



export class BuyerInfoDTO {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  email: string;
}
export class ProjectResponseDTO {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  outline: string;

  @ApiProperty()
  @Expose()
  requirements: string;

  @ApiProperty()
  @Expose()
  budgetRange: string;

  @ApiProperty()
  @Expose()
  timeline: string;

  @ApiProperty()
  @Expose()
  skillsRequired: string[];

 

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  attachment: string | null;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  statusColor: string;

  @ApiProperty()
  @Expose()
  buyerInfo?: BuyerInfoDTO;

  @ApiProperty()
  @Expose()
  bidCount?:any;

  constructor(partial: Partial<ProjectResponseDTO>) {
    Object.assign(this, partial);
  }
}
