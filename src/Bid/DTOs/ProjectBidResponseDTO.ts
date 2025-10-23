import { ProjectStatus } from "src/Project/entity/project.entity";
import { BidStatus } from "../Entity/Bid.entity";
import { ApiProperty } from "@nestjs/swagger";

export class SellerBidDTO {
    @ApiProperty()
  id: number;
  @ApiProperty()
  sellerId: number;
  @ApiProperty()
  sellerName: string;
  @ApiProperty()
  bidAmount: number;
  @ApiProperty()
  timeline: string;
  @ApiProperty()
  proposalText: string;
  @ApiProperty()
  attachment: string | null;
  @ApiProperty()
  status: BidStatus;

  constructor(partial: Partial<SellerBidDTO>) {
    Object.assign(this, partial);
  }
}

export class ProjectWithBidsDTO {
    @ApiProperty()
  id: number;
  @ApiProperty()
  projectTitle: string;
  @ApiProperty()
  outline: string;
  @ApiProperty()
  requirements: string;
  @ApiProperty()
  budgetRange: string;
  @ApiProperty()
  timeline: string;
  @ApiProperty()
  skillsRequired: string[];
  @ApiProperty()
  status: ProjectStatus;
  @ApiProperty()
  attachment: string | null;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  bids: SellerBidDTO[];

  constructor(partial: Partial<ProjectWithBidsDTO>) {
    Object.assign(this, partial);
  }
}