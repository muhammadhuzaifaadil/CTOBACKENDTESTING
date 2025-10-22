import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './Entities/User.entity.js';
import { UserController } from './Controllers/User.controller.js';
import { AuthService } from '../Auth/Service/auth.service.js';
import { AuthModule } from '../Auth/Auth.module.js';
import { UserService } from './Service/user.service.js';
import { Roles } from '../Roles/Entities/Role.entity.js';
import { SellerProfile } from '../Seller/Entity/SellerProfile.entity.js';
import { BuyerProfile } from '../BuyerProfile/Entity/BuyerProfile.entity.js';
import { Company } from '../Company/Entities/Company.entity.js';
import { Contact } from '../Contact/Entities/Contact.entity.js';
import { mapperService } from '../Common/Utility/mapper.dto.js';

@Module({
  imports: [TypeOrmModule.forFeature([User,Company,Contact,Roles,SellerProfile,BuyerProfile]),
  AuthModule],
  providers: [UserService,mapperService],
  controllers: [UserController]
})
export class UserModule { }
