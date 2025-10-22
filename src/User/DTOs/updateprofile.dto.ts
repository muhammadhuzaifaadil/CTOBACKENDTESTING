import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class updateProfileDTO{

    @ApiProperty()
    @IsOptional()
    FirstName?:string;

    @ApiProperty()
    @IsOptional()
    MiddleName?:string;

    @ApiProperty()
    @IsOptional()
    LastName?:string;

    @ApiProperty()
    @IsOptional()
    PhoneCode?:string;

    @ApiProperty()
    @IsOptional()
    PhoneNumber?:string;

    @ApiProperty()
    @IsOptional()
    Address?:string;
    @ApiProperty()
    @IsOptional()
    City?:string;
    @ApiProperty()
    @IsOptional()
    Country?:string;

    @ApiProperty()
    @IsOptional()
    CompanyName?:string;
    @ApiProperty()
    @IsOptional()
    websiteUrl?:string;
    @ApiProperty()
    @IsOptional()
    businessCategory?:string;
    @ApiProperty()
    @IsOptional()
    experience?: number;


}