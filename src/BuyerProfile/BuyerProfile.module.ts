import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuyerProfile } from './Entity/BuyerProfile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BuyerProfile])],
  providers: [],
  controllers: []
})
export class BuyerProfileModule { }
