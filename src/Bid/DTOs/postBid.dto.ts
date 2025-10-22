import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { BidStatus } from "../Entity/Bid.entity";

export class postBidDTO{



    // @ApiProperty()
    // SellerId:number;

    @ApiProperty()
    ProjectId:number;

    @ApiProperty()
    proposalText:string;

    @ApiProperty()
    timeline:string;

    // @ApiProperty()
    //   @IsEnum(BidStatus)
    //   @IsOptional()
    //   status?: BidStatus;

      @ApiProperty()
      @IsOptional()
      @IsString()
      attachment?: string;


    @ApiProperty()
    bidAmount:number;

    
}