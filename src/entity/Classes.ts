import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Commments } from "./Comments";

@ObjectType()
@Entity()
export class Classes extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  description: string;

  @Field(() => Int)
  @Column("int")
  total: number;

  @Field(() => Int)
  @Column("int")
  nums: number;

  @Field(() => [Commments])
  @OneToMany(() => Commments, (commment) => commment.ownerClass)
  comments: Commments[];
}
