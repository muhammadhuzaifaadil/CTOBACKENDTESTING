import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('Contact')
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  phoneCode: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  country?: string;
}
