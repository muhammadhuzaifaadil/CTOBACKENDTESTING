// dto/create-project.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ProjectStatus, StatusColor } from '../entity/project.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';

// export class CreateProjectDto {
//   @ApiProperty()
//   @IsString()
//   @IsNotEmpty()
//   title: string;

//   @ApiProperty()
//   @IsString()
//   @IsNotEmpty()
//   outline: string;

//   @ApiProperty()
//   @IsString()
//   @IsNotEmpty()
//   requirements: string;

//   @ApiProperty()
//   @IsString()
//   @IsNotEmpty()
//   budgetRange: string;

//   @ApiProperty()
//   @IsString()
//   @IsNotEmpty()
//   timeline: string;

//   // @ApiProperty()
//   // @IsString()
//   // @IsNotEmpty()
//   // skillsRequired: string[];


//   @ApiProperty({ type: [String] })
// @IsOptional()
// @IsArray()
// @IsString({ each: true })
// skillsRequired: string[];


//  @ApiProperty()
// @IsOptional()
// @IsString()
// attachment?: string | null;

//   // @Exclude()
//   // @ApiProperty()
//   // @IsNumber()
//   // userId: number;

//   @ApiProperty()
//   @IsEnum(ProjectStatus)
//   @IsOptional()
//   status?: ProjectStatus;

//   @ApiProperty()
//   @IsEnum(StatusColor)
//   @IsOptional()
//   statusColor?: StatusColor;
// }


export class ProjectTemplateQuestions{
   @ApiProperty()
  @IsOptional()
  @IsString()
  questionText: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  questionValue: string;
}
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
  @IsOptional()
  ThirdPartyIntegrations?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  budgetRange: string;

   

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  timeline: string;


  @ApiProperty()
  @IsString()
  @IsOptional()
  TargetUser?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  UIUXRequirement?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  PreferredTechStack?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  PostLaunchSupport?: string;


  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status: string;

  // @ApiProperty()
  // @IsArray()
  // @IsString({ each: true })
  // skillsRequired: string[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  attachment?: string; // URL returned from Cloudinary

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  templateId:number;

  @ApiProperty({ type: () => [ProjectTemplateQuestions] })
  @ValidateNested()
  @Type(() => ProjectTemplateQuestions)
  templateQuestions: [ProjectTemplateQuestions];

}

export class UpdateProjectDto{



  @ApiProperty()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty()
  @IsString()
    @IsOptional()

  outline?: string;

  @ApiProperty()
  @IsString()
    @IsOptional()

  requirements?: string;

  @ApiProperty()
  @IsString()
    @IsOptional()

  budgetRange?: string;

  @ApiProperty()
  @IsString()
    @IsOptional()

  timeline?: string;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // skillsRequired: string[];


  @ApiProperty({ type: [String] })
@IsOptional()
@IsArray()
@IsString({ each: true })
skillsRequired?: string[];


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