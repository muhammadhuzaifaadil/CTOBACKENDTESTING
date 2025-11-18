
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, OneToMany } from "typeorm";
import { Template } from "./Template.entity";
import { ProjectAnswer } from "./ProjectAnswer.entity";

export enum QuestionType {
  TEXT = 'text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  ARRAY = 'array',
  DROPDOWN = 'dropdown'
}

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

  @Column({ type: 'text' })
  questionText: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
  })
  type: QuestionType;

  @Column({ type: 'json', nullable: true })
  options: any;

  @Column({ default: false })
  isCommon: boolean;

  @Column({ default: true })
  isRequired: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @OneToMany(() => ProjectAnswer, (ans) => ans.question)
  answers: ProjectAnswer[];
}
