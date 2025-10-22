import { ApiProperty } from "@nestjs/swagger";
import { BidStatus } from "../Entity/Bid.entity";

export class BidResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  projectTitle: string;

  @ApiProperty()
  buyerName: string;

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

  constructor(partial: Partial<BidResponseDTO>) {
    Object.assign(this, partial);
  }
}
