import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpEntity } from './Entity/OTP.entity';
import { OtpService } from './Service/OTP.service';
import { User } from 'src/User/Entities/User.entity';
import { EmailService } from 'src/Common/Utility/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([OtpEntity,User])],
  providers: [EmailService,OtpService],
  controllers: []
})
export class OTPModule { }
