import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

// forgot-password.dto.ts
export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

// reset-password.dto.ts
export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  token: string;

  @ApiProperty()
  @MinLength(6)
  @IsNotEmpty()
  newPassword: string;
}