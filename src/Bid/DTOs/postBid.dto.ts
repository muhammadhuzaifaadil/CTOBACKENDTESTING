import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { BidStatus } from "../Entity/Bid.entity";

export class postBidDTO{



    // @ApiProperty()
    // SellerId:number;

    @ApiProperty()
    @IsNumber()
    ProjectId:number;

    @ApiProperty()
    @IsString()
    proposalText:string;

    @ApiProperty()
    @IsString()
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
    @IsNumber()
    bidAmount:number;

    
}