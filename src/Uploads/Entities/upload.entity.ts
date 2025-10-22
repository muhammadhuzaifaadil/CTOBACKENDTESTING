// src/entities/upload.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('uploads')
export class Upload {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fileName: string;

  @Column()
  filePath: string;

  @Column()
  fileType: string;

  @Column()
  fileSize: number;

  @Column({ nullable: true })
  uploadedBy?: number; // optional: link to user ID later

  @CreateDateColumn()
  createdAt: Date;
}
