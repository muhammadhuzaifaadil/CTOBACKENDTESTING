// dto/create-project.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsArray } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ProjectStatus, StatusColor } from '../entity/project.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  outline: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  requirements: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  budgetRange: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  timeline: string;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // skillsRequired: string[];


  @ApiProperty({ type: [String] })
@IsOptional()
@IsArray()
@IsString({ each: true })
skillsRequired: string[];


 @ApiProperty()
@IsOptional()
@IsString()
attachment?: string | null;

  // @Exclude()
  // @ApiProperty()
  // @IsNumber()
  // userId: number;

  @ApiProperty()
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiProperty()
  @IsEnum(StatusColor)
  @IsOptional()
  statusColor?: StatusColor;
}


export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

