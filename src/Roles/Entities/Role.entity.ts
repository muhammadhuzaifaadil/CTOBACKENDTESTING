import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../User/Entities/User.entity';

export enum RoleType {
    SUPERADMIN = 'superadmin',
    BUYER = 'buyer',
    SELLER = 'seller'
}

@Entity('Role')
export class Roles {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: RoleType,
    })
    name: RoleType;

    @OneToMany(() => User, user => user.role)
    users: User[];
}