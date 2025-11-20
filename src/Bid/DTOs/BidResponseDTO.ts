import { ApiProperty } from "@nestjs/swagger";
import { BidStatus } from "../Entity/Bid.entity";
import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";



export class projectReponseDTO{

  @ApiProperty()
  id?:number;

  @ApiProperty()
  status?:boolean;

  @ApiProperty()
  title: string;
  @ApiProperty()
  budgetRange: string;

  @ApiProperty()
  buyerName: string;

  @ApiProperty()
  buyerEmail: string;


}
export class BidResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  projectTitle: string;

  @ApiProperty()
  buyerName: string;

  @ApiProperty()
  buyerEmail: string;

  @ApiProperty()
  projectBudget: string;
  

  @ApiProperty()
  sellerName: string;

  @ApiProperty()
  proposalText: string;

  @ApiProperty()
  bidAmount: number;

  @ApiProperty()
  timeline: string;

  @ApiProperty({ required: false, nullable: true })
  attachment: string | null;

  @ApiProperty({ enum: BidStatus })
  status: BidStatus;

  @ApiProperty()
  createdAt:any;

  @ApiProperty({ type: () => projectReponseDTO })
  @Type(() => projectReponseDTO)
  projectInfo: projectReponseDTO;

  constructor(partial: Partial<BidResponseDTO>) {
    Object.assign(this, partial);
  }
}
