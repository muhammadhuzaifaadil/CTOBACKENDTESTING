
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, OneToMany } from "typeorm";
import { Template } from "./Template.entity";
import { Project } from "src/Project/entity/project.entity";

// export enum QuestionType {
//   TEXT = 'text',
//   NUMBER = 'number',
//   BOOLEAN = 'boolean',
//   SELECT = 'select',
//   ARRAY = 'array',
//   DROPDOWN = 'dropdown'
// }

@Entity('template_questions')
export class TemplateQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Template, (template) => template.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'templateId' })
  template: Template;



  @Column()
  templateId: number;

  @Column()
  projectId?: number;

  @Column()
  userId?: number;

  @Column({ type: 'text' })
  questionText: string;

  @Column({ type: 'text'})
  value: string;

}
