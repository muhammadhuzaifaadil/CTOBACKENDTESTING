import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity('Notification')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar' })
    nTitle: string;

    @Column({ type: 'varchar' })
    nBody: string;

    @Column({ type: 'int' })
    notifiedUserId: number;

    @Column({ type: 'int' })
    notifierUserId: number;

    @CreateDateColumn()
      createdAt: Date;
    
      @UpdateDateColumn()
      updatedAt: Date;

}
