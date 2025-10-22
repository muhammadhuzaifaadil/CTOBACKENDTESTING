import { Company } from "../../Company/Entities/Company.entity";
import { Contact } from "../../Contact/Entities/Contact.entity";
import { User } from "../../User/Entities/User.entity";
import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne, Column } from "typeorm";

@Entity('SellerProfile')
export class SellerProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { cascade: true })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Contact, { cascade: true, eager: true })
  contact: Contact;

  @ManyToOne(() => Company, { cascade: true, eager: true })
  company: Company;

  @Column({ default: false })
  acceptedTerms: boolean;
}
