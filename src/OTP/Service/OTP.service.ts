import { Injectable, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OtpEntity } from '../Entity/OTP.entity';
import { EmailService } from '../../Common/Utility/email.service';
import { randomBytes } from 'crypto';
import { User } from 'src/User/Entities/User.entity';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(OtpEntity)
    private otpRepo: Repository<OtpEntity>,
    @InjectRepository(User)
     private readonly userRepo: Repository<User>,
    private emailService: EmailService,
  ) {}

  async generateOtp(email: string) {

    const user = await this.userRepo.findOne({ where: { email } });
    if(!user) throw new BadRequestException('User not found');
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.otpRepo.save({ email, otp, expiresAt, attempts: 0 });

    await this.emailService.sendMail(
      email,
      'Your OTP Code',
      `Your OTP is ${otp}. It will expire in 5 minutes.`
    );

    return { message: `OTP sent successfully${otp} remove after testing` };
  }



async verifyOtp(email: string, otp: string) {
    const OTPUser = await this.userRepo.findOne({ where: { email:email } });
    if(!OTPUser) throw new BadRequestException('User not found');
  const otpRecord = await this.otpRepo.findOne({
    where: { email },
    order: { createdAt: 'DESC' },
  });

  // --- Step 1: Basic validations ---
  if (!otpRecord) throw new BadRequestException('OTP not found');
  if (otpRecord.attempts >= 3)
    throw new BadRequestException('Maximum attempts reached');
  if (otpRecord.expiresAt < new Date())
    throw new BadRequestException('OTP expired');

  // Increment attempt count before checking
  otpRecord.attempts += 1;
  await this.otpRepo.save(otpRecord);

  // --- Step 2: Compare OTP ---
  if (otpRecord.otp !== otp)
    throw new BadRequestException('Invalid OTP');

  // --- Step 3: OTP verified successfully ---
  // Optional cleanup
  await this.otpRepo.delete({ email });

  // --- Step 4: Generate secure token (same as forgotPassword) ---
  const user = await this.userRepo.findOne({ where: { email } });
  if (!user) throw new BadRequestException('User not found');

  const token = randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
  await this.userRepo.save(user);

  // --- Step 5: Return reset token ---
  return {
    message: 'OTP verified successfully. You can now reset your password.',
    resetToken: token,
  };
}

}
