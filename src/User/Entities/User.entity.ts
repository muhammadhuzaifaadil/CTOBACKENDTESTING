import { Company } from 'src/Company/Entities/Company.entity';
import { Contact } from 'src/Contact/Entities/Contact.entity';
import { Roles } from '../../Roles/Entities/Role.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, ManyToMany, OneToOne } from 'typeorm';
import { Project } from 'src/Project/entity/project.entity';
import { Bid } from 'src/Bid/Entity/Bid.entity';
// import { Roles } from 'src/Roles/Entity/roles.entity';
// import { Inbox } from 'src/Inbox/Entities/Inbox.entity';

@Entity('User')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  middleName?: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  password: string;
  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date;

  @Column({ nullable: true })
  refreshToken?: string;
  
  @ManyToOne(() => Roles, (role) => role.users)
  role: Roles;

  @OneToOne(() => Company, { cascade: true, eager: true })
@JoinColumn()
company: Company;

@OneToOne(() => Contact, { cascade: true, eager: true })
@JoinColumn()
contact: Contact;
// Each Project belongs to exactly one Buyer.
@OneToMany(() => Project, (project) => project.user)
projects: Project[];

// Each Bid belongs to one Seller.
@OneToMany(() => Bid, (bid) => bid.seller)
bids: Bid[];
}