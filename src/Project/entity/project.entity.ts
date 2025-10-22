// project.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../User/Entities/User.entity'; // adjust import as needed
import { Exclude } from 'class-transformer';
import { Bid } from 'src/Bid/Entity/Bid.entity';


export enum ProjectStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
}

export enum StatusColor {
  DRAFTCOLOR = 'red',
  PUBLISHEDCOLOR = 'cyan',
  IN_PROGRESSCOLOR = '#cb9d33ff',
  COMPLETEDCOLOR = 'green',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  title: string;

  @Column({ type: 'text' })
  outline: string;

  @Column({ type: 'text' })
  requirements: string;

  @Column({ type: 'varchar', length: 100 })
  budgetRange: string;

  @Column({ type: 'varchar', length: 100 })
  timeline: string;

  // @Column({ type: 'varchar', length: 255 })
  // skillsRequired: string;

@Column("text", { array: true, nullable: true })
skillsRequired: string[];

  // @Column({ nullable: true })
  // attachment?: string; // could be file path or URL


  @Column({ type: 'varchar', length: 255, nullable: true })
attachment: string | null;

   @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.DRAFT,
  })
  status: ProjectStatus;

  @Column({
    type:'enum',
    enum: StatusColor,
    nullable: true
  })
  statusColor:StatusColor;

  // Relation: Many Projects belong to one User
  // A Buyer (User) can create multiple projects.
  @ManyToOne(() => User, (user) => user.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
// A Project can have many bids (many sellers bidding).
  @OneToMany(() => Bid, (bid) => bid.project)
bids: Bid[];
}
