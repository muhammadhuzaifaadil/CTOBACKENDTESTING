import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class TokenUserDTO {// or derive from JWT in the future for logged-in users

  @ApiProperty()
  @IsNotEmpty()
  userId: number;



  @ApiProperty()
  @IsNotEmpty()
  refreshToken: string;



}