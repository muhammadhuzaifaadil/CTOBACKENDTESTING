import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerProfile } from './Entity/SellerProfile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SellerProfile])],
  providers: [],
  controllers: []
})
export class SellerProfileModule { }
