import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Classes } from "./Classes";
import { User } from "./User";

@ObjectType()
@Entity()
export class Commments extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => User)
  @ManyToOne(() => User, (commenter) => commenter.comments)
  commenter: User;

  @Field(() => Int)
  @Column()
  rating: number;

  @Field()
  @Column()
  comment: string;

  @Field(() => Classes)
  @ManyToOne(() => Classes, (parentclass) => parentclass.comments)
  ownerClass: Classes;
}
