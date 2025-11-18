import { 
  Body, 
  Controller, 
  Post, 
  BadRequestException, 
  UseGuards,
  UploadedFiles,
  UseInterceptors,
  Get
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../Service/auth.service';
import { RegisterDto } from '../DTOs/register-user.dto';
import { User } from '../../User/Entities/User.entity';
import { LoginDto } from '../DTOs/login-user.dto';
import { ForgotPasswordDto, ResetPasswordDto } from '../DTOs/forgotpassword.dto';
import { UpdatePasswordDto } from '../DTOs/update-userpass.dto';
import { CurrentUser } from 'src/Common/Decorator/user.decorator';
import { OtpService } from 'src/OTP/Service/OTP.service';
import { RequestOtpDto } from 'src/OTP/DTOs/request-otp.dto';
import { VerifyOtpDto } from 'src/OTP/DTOs/verify-otp.dto';
import { AuthGuard } from '@nestjs/passport';
import { TokenUserDTO } from '../DTOs/token-user.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UpdateFcmTokenDto } from 'src/User/DTOs/updatefcmtoken.dto';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService
  
  ) {}

  /**
   * Buyer/Seller Registration Endpoint
   */
  // @Post('register')
  // @ApiResponse({ status: 201, description: 'User successfully registered', type: User })
  // @ApiResponse({ status: 400, description: 'Invalid data or missing fields' })
  // @ApiResponse({ status: 409, description: 'Email already registered' })
  // async register(@Body() dto: RegisterDto): Promise<User> {
  //   try {
  //     return await this.authService.register(dto);
  //   } catch (error) {
  //     throw new BadRequestException(error.message || 'Registration failed');
  //   }
  // }
@Post('register')
@UseInterceptors(
  FileFieldsInterceptor([
    { name: 'companyLogo', maxCount: 1 },
    { name: 'businessLicense', maxCount: 1 },
    { name: 'portfolio', maxCount: 1 },
  ]),
)
async register(
  @Body() dto: RegisterDto,
  @UploadedFiles() files: Record<string, Express.Multer.File[]>,
) {
  return this.authService.register(dto, files);
}

  @Post("login")
  @ApiOperation({ summary: "Login user and return access + refresh token" })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
 @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  async refresh(@Body() dto:TokenUserDTO) {
    return this.authService.refreshToken( dto.userId,dto.refreshToken);
  }

  // @Post('forgot-password')
  // @ApiOperation({ summary: 'Initiate password reset process' })
  // @ApiResponse({ status: 200, description: 'Password reset link sent if email exists' })
  // @ApiResponse({ status: 400, description: 'Invalid email format' })
  // async forgotPassword(@Body() dto: ForgotPasswordDto) {
  //   return this.authService.forgotPassword(dto);
  // }

  @Post('generate-otp')
  @ApiOperation({ summary: 'Generate and send OTP to email' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid email format' })
  async generateOtp(
    @Body() dto: ForgotPasswordDto
  ) {
    return this.otpService.generateOtp(dto.email);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP for email' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.otpService.verifyOtp(dto.email, dto.otp);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password using token' })
  @ApiResponse({ status: 200, description: 'Password successfully reset' })
  @ApiResponse({ status: 400, description: 'Invalid token or password criteria not met' })
  async resetPassword(@Body() dto:ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }


  
  @Get('/getallbuyers')
  async getAllBuyers() {
    return await this.authService.getAllBuyers();
  }
  @Get('getallsellers')
  async getAllSellers() {
    return await this.authService.getAllSellers();
  }




  @Post('update-fcm-token')
@UseGuards(AuthGuard('jwt'))
async updateFcmToken(
  @CurrentUser('userId') userid:any,
  @Body() dto: UpdateFcmTokenDto,
) {
  return this.authService.updateFcmToken(userid, dto.fcmToken);
}


}
