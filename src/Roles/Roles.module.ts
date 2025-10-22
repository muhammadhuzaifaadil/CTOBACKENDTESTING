import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles } from './Entities/Role.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Roles])],
  providers: [],
  controllers: []
})
export class RolesModule { }
