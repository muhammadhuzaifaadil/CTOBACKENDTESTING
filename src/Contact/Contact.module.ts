import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './Entities/Contact.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contact])],
  providers: [],
  controllers: []
})
export class ContactModule { }
