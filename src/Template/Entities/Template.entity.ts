// template.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { TemplateQuestion } from "./TemplateQuestion.entity";
import { ProjectNew } from "src/Project/entity/project.entity";

@Entity('template')
export class Template {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => TemplateQuestion, (question) => question.template)
  questions: TemplateQuestion[];

  @OneToMany(() => ProjectNew, (project:ProjectNew) => project.template)
  projects: ProjectNew[];
}
