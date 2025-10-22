import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './Service/auth.service';
import { AuthController } from './Controller/auth.controller';
import { UserModule } from 'src/User/User.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './jwtstrategy';
import { User } from '../User/Entities/User.entity';
import { Roles } from '../Roles/Entities/Role.entity';
import { Contact } from '../Contact/Entities/Contact.entity';
import { Company } from '../Company/Entities/Company.entity';
import { BuyerProfile } from '../BuyerProfile/Entity/BuyerProfile.entity';
import { SellerProfile } from '../Seller/Entity/SellerProfile.entity';
import { EmailService } from 'src/Common/Utility/email.service';
import { OtpService } from 'src/OTP/Service/OTP.service';
import { OtpEntity } from 'src/OTP/Entity/OTP.entity';
import { UploadModule } from 'src/Uploads/upload.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([User, Roles,Contact,Company,BuyerProfile,SellerProfile,OtpEntity]),UploadModule,
    JwtModule.register({
      secret: 'your_jwt_secret_key', // store in .env later
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy,EmailService,OtpService],
  exports: [AuthService],
})
export class AuthModule {}