
// import { ProjectNew } from "src/Project/entity/project.entity";
// import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from "typeorm";
// import { TemplateQuestion } from "./TemplateQuestion.entity";

// @Entity('project_answers')
// export class ProjectAnswer {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @ManyToOne(() => ProjectNew, (project) => project.answers, { onDelete: 'CASCADE' })
//   @JoinColumn({ name: 'projectId' })
//   project: ProjectNew;

//   @Column()
//   projectId: number;

//   @ManyToOne(() => TemplateQuestion, (question) => question.answers, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({ name: 'questionId' })
//   question: TemplateQuestion;

//   @Column()
//   questionId: number;

//   @Column({ type: 'text', nullable: true })
//   answer: string;
// }
