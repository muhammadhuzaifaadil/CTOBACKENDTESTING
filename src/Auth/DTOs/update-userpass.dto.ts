// update-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class UpdatePasswordDto {// or derive from JWT in the future for logged-in users

  @ApiProperty()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty()
  @MinLength(8)
  newPassword: string;

  @ApiProperty()
  @MinLength(8)
  confirmNewPassword: string;
}
