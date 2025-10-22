import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './Entities/Company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  providers: [],
  controllers: []
})
export class CompanyModule { }
