// bid.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bid } from './Entity/Bid.entity';
import { BidController } from './Controller/bid.controller';
import { BidService } from './Services/Bid.service';
import { User } from 'src/User/Entities/User.entity';
import { Project } from 'src/Project/entity/project.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Bid,User,Project])],
  controllers: [BidController],
  providers: [BidService],
  exports: [BidService],
})
export class BidModule {}
