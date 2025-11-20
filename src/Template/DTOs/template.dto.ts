import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsEnum, isNotEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
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



  //   @ApiProperty({ type: () => [CreateTemplateQuestionDto] })
  // @ValidateNested({ each: true })
  // @Type(() => CreateTemplateQuestionDto)
  // @IsArray()
  // templateQuestions: CreateTemplateQuestionDto[];
}


export class CreateTemplateQuestionDto {
 

  @ApiProperty()
  @IsNotEmpty()
  questionText: string;

  @ApiProperty()
  @IsNumber()
  projectId:number;
  @ApiProperty()
  @IsNumber()
  userId:number;
  @ApiProperty()
  @IsNotEmpty()
  value: string;

}