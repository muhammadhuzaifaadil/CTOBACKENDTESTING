import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateFcmTokenDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  userId: number;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fcmToken: string;
}
