import { Module } from "@nestjs/common";
import { templateController } from "./Controller/template.controller";
import { TemplateQuestion } from "./Entities/TemplateQuestion.entity";
import { TemplateService } from "./Services/template.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Template } from "./Entities/Template.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Template,TemplateQuestion])
  ],
  controllers: [templateController],
  providers: [TemplateService],
})
export class TemplateModule {}