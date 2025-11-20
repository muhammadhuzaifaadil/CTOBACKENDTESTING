import { Repository } from "typeorm";
import { CreateTemplateDto } from "../DTOs/template.dto";
import { Template } from "../Entities/Template.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { TemplateQuestion } from "../Entities/TemplateQuestion.entity";
import { NotFoundException } from "@nestjs/common";

export class TemplateService{

    constructor(
        @InjectRepository(Template)
        private readonly templateRepo:Repository<Template>,
        @InjectRepository(TemplateQuestion)
        private readonly templateQuestionRepo:Repository<TemplateQuestion>
    ){}



    async createTemplate(dto: CreateTemplateDto) {
  const template = this.templateRepo.create({
    name: dto.name,
    description: dto.description,
  });

  const savedTemplate = await this.templateRepo.save(template);

  // const questionEntities = dto.templateQuestions.map(q =>
  //   this.templateQuestionRepo.create({
  //     ...q,
  //     templateId: savedTemplate.id,
  //   })
  // );

  // await this.templateQuestionRepo.save(savedTemplate);

  return { template: savedTemplate };
}




async getAllTemplates() {
    return this.templateRepo.find({
      order: { id: 'ASC' },
    });
  }

async getTemplateById(templateId: number) {
    const template = await this.templateRepo.findOne({
      where: { id: templateId },
      relations: ['questions'], 
      order: {
        questions: {
          id: 'ASC',
        },
      },
    });

    if (!template) {
      throw new NotFoundException(`Template ID ${templateId} not found`);
    }

    return template;
  }

}