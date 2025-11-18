import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { QuestionType } from "../Entities/TemplateQuestion.entity";
import { Type } from "class-transformer";

export class CreateTemplateDto{
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    description: string;


    //   @ApiProperty({ type: () => CreateTemplateQuestionDto })
    //   @ValidateNested()
    //   @Type(() => CreateTemplateQuestionDto)
    //   templatequestions: CreateTemplateQuestionDto;

    @ApiProperty({ type: () => [CreateTemplateQuestionDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateQuestionDto)
  @IsArray()
  templateQuestions: CreateTemplateQuestionDto[];
}


export class CreateTemplateQuestionDto {
 

@ApiProperty()
  @IsNotEmpty()
  questionText: string;
@ApiProperty()
  @IsEnum(QuestionType)
  type: QuestionType;
    @ApiProperty()
  @IsOptional()
  @IsArray()
  options?: any[];
    @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isCommon?: boolean;
    @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
    @ApiProperty()
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}