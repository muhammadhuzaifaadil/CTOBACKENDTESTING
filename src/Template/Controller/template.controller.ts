import { UseGuards, Controller, Post, Body, Get, Param } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { TemplateService } from "../Services/template.service";
import { CurrentUser } from "src/Common/Decorator/user.decorator";
import { CreateTemplateDto } from "../DTOs/template.dto";

@ApiTags('Template')
@ApiBearerAuth('access-token') // Match this with 'access-token' in main.ts
@UseGuards(AuthGuard('jwt'))  
@Controller('template')
export class templateController
{
    constructor(private readonly templateService:TemplateService){}


    @Post()
    async create(
      @CurrentUser('userId') userId: number,
      @Body() body: CreateTemplateDto) 
    {
        return await this.templateService.createTemplate(body);
    }



    @Get()
  getAllTemplates() {
    return this.templateService.getAllTemplates();
  }

  @Get(':id')
  getTemplateById(@Param('id') id: number) {
    return this.templateService.getTemplateById(id);
  }
}