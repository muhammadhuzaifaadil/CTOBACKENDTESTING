import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('Company')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  logoUrl?: string;

  @Column({ nullable: true })
  businessCategory?: string;

  @Column({ nullable: true })
  companyDetail?: string;

  @Column({ nullable: true })
  websiteUrl?: string;

  @Column({ nullable: true })
  businessLicenseUrl?: string;

  @Column({ nullable: true })
  portfolioUrl?: string;
}
