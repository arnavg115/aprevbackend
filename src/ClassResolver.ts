import {
  Mutation,
  Query,
  Resolver,
  Arg,
  Int,
  UseMiddleware,
  Ctx,
} from "type-graphql";
import { Classes } from "./entity/Classes";
import { Commments } from "./entity/Comments";
import { User } from "./entity/User";
import { isAuth } from "./isAuth";
import { MyContext } from "./MyContext";

@Resolver()
export default class ClassResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async addClass(
    @Arg("name") name: string,
    @Arg("description") description: string
  ): Promise<boolean> {
    await Classes.insert({
      name,
      description,
      nums: 0,
      total: 0,
    });
    return true;
  }

  @Query(() => [Classes])
  async ListClasses(): Promise<Classes[]> {
    const all = await Classes.find();
    return all;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async addComment(
    @Arg("comment") comment: string,
    @Arg("ownerClass") ownerClass: string,
    @Arg("rating", () => Int) rating: number,
    @Ctx() { payload }: MyContext
  ) {
    if (!payload || !payload.userId) {
      throw new Error("Internal error");
    }
    const parent = await Classes.findOne({ where: { name: ownerClass } });
    const user = await User.findOne({ where: { id: payload.userId } });
    if (!parent || !user) {
      throw new Error("User not found");
    }
    parent.nums = parent.nums + 1;
    parent.total = parent.total + rating;
    parent.save();
    const comm = new Commments();
    comm.commenter = user;
    comm.comment = comment;
    comm.rating = rating;
    comm.ownerClass = parent;
    await Commments.save(comm);
    return true;
  }

  @Query(() => [Commments])
  async listComments() {
    const all = await Commments.find({
      relations: ["ownerClass", "commenter"],
    });
    return all;
  }

  @Query(() => Classes)
  async getOneClass(@Arg("className") className: string): Promise<Classes> {
    const cla = await Classes.findOne({
      where: { name: className },
      relations: ["comments", "comments.commenter"],
    });
    if (!cla) {
      throw new Error("Class does not exist");
    }
    return cla;
  }
}
