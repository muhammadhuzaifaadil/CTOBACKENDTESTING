import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../User/Entities/User.entity';
import { Project } from '../../Project/entity/project.entity';

export enum BidStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
  WITHDRAWN = 'Withdrawn',
  AWARDED = "Awarded"
}

@Entity('bids')
export class Bid {
  @PrimaryGeneratedColumn()
  id: number;
// A Seller (User) can make multiple bids.
  @ManyToOne(() => User, (user) => user.bids, { onDelete: 'CASCADE' })
  seller: User;
// Each Bid belongs to one project.
  @ManyToOne(() => Project, (project) => project.bids, { onDelete: 'CASCADE' })
  project: Project;

  @Column({ type: 'varchar', length: 500 })
  proposalText: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  bidAmount: number;

  @Column({ type: 'varchar', length: 50 })
  timeline: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  attachment: string | null;

  @Column({ default: false })
  isWithdrawn: boolean;
  

  @Column({
    type: 'enum',
    enum: BidStatus,
    default: BidStatus.PENDING,
  })
  status: BidStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

    // New fields for bid tracking and tax
  @Column({ type: 'int', default: 0 })
  monthlyBidCount: number; // total bids made in that month

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxApplied: number; // 0 if free, else e.g. 50

  @Column({ default: false })
  isTaxed: boolean; // whether this bid was charged
}
