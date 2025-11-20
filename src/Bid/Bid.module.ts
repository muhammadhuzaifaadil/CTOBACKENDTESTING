// bid.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bid } from './Entity/Bid.entity';
import { BidController } from './Controller/bid.controller';
import { BidService } from './Services/Bid.service';
import { User } from 'src/User/Entities/User.entity';
import { Project } from 'src/Project/entity/project.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { NotificationService } from 'src/notification/notification.service';
import { Notification } from 'src/notification/entities/notification.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Bid,User,Project,Notification]),NotificationModule],
  controllers: [BidController],
  providers: [BidService],
  exports: [BidService],
})
export class BidModule {}
