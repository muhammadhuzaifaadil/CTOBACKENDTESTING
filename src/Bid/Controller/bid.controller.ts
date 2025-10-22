import { UseGuards, Controller, Post, Body, Get, Param, ParseIntPipe, Put, Query } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { BidService } from "../Services/Bid.service";
import { CurrentUser } from "src/Common/Decorator/user.decorator";
import { postBidDTO } from "../DTOs/postBid.dto";

@ApiTags('Bids')
@ApiBearerAuth('access-token') // Match this with 'access-token' in main.ts
@UseGuards(AuthGuard('jwt'))  
@Controller('bids')
export class BidController {
  constructor(private readonly bidService: BidService) {}

   @Post()
     create(@CurrentUser('userId') userId: number,@Body() dto: postBidDTO) {
       return this.bidService.createBid(userId,dto);
     }

    @Get()
        getAll(@CurrentUser('userId') userId: number,@CurrentUser('role') userRole: any) {
            return this.bidService.getAllBids(userId,userRole);
        }
     
    @Get(':id')
        getById(@Param('id', ParseIntPipe) id: number,@CurrentUser('userId') userId: number,@CurrentUser('role') userRole: any) {
            return this.bidService.getBidById(id,userId,userRole);
        }
    
    @Put(':id/withdraw')
        async withdrawBid(@Param('id', ParseIntPipe) id: number,@CurrentUser('userId') userId:number,@CurrentUser('role') userRole:any)
        {
            return this.bidService.withdrawBid(id,userId,userRole);
        }

       @Get('paginated/all')
       @ApiQuery({ name: 'filterKey', required: false, type: String, description: 'Field name to filter by (e.g. firstName, email)' })
       @ApiQuery({ name: 'filterBy', required: false, type: String, description: 'Value to search for' })
       @ApiQuery({ name: 'page', required: true, type: Number, description: 'Page number' })
       @ApiQuery({ name: 'limit', required: true, type: Number, description: 'Items per page' })
      async getPaginated(
        @CurrentUser('userId') userId: number,
        @CurrentUser('role') userRole: any,
        @Query('filterKey') filterKey?: string,
        @Query('filterBy') filterBy?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
       
      ) {
        return this.bidService.getBidsPaginated(
          userRole,
          userId,
          filterBy,
          filterKey,
          page,
          limit,
        );
      }

      @Get('summary/:sellerId')
async getBidSummary(@CurrentUser('userId') sellerId: number) {
  return this.bidService.getMonthlyBidSummary(sellerId);
}

}
