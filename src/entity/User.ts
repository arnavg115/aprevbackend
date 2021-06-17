import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  JoinTable,
  ManyToMany,
  OneToMany,
} from "typeorm";
import { Classes } from "./Classes";
import { Commments } from "./Comments";

@ObjectType()
@Entity("users")
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  email: string;

  @Column()
  password: string;

  @Column("int", { default: 0 })
  tokenVersion: number;

  @Field(() => [Commments])
  @OneToMany(() => Commments, (comment) => comment.commenter)
  comments: Commments[];

  @Field(() => [Classes])
  @ManyToMany(() => Classes)
  @JoinTable()
  classes: Classes[];
}
