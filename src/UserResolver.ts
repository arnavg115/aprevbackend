import {
  Arg,
  Ctx,
  Field,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { User } from "./entity/User";
import { hash, compare } from "bcryptjs";

import { MyContext } from "./MyContext";
import { createAccessToken, createRefreshToken } from "./auth";
import { isAuth } from "./isAuth";
import { sendRefreshToken } from "./sendRefreshToken";
import { getConnection } from "typeorm";
import { verify } from "jsonwebtoken";
import { Classes } from "./entity/Classes";

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
  @Field(() => User)
  user: User;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return "hi!";
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  bye(@Ctx() { payload }: MyContext) {
    return `your user id is ${payload?.userId}`;
  }

  @Query(() => [User])
  users() {
    return User.find();
  }
  @Query(() => User, { nullable: true })
  me(@Ctx() context: MyContext) {
    const authorization = context.req.headers.authorization;

    if (!authorization) {
      return null;
    }

    try {
      const token = authorization?.split(" ")[1];
      const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
      return User.findOne(payload.userId);
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  @Mutation(() => Boolean)
  async register(
    @Arg("email") email: string,
    @Arg("password") password: string
  ) {
    const hashed = await hash(password, 12);
    try {
      await User.insert({
        email,
        password: hashed,
      });
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error("user not found");
    }

    const valid = await compare(password, user.password);

    if (!valid) {
      throw new Error("incorrect password");
    }

    sendRefreshToken(res, createRefreshToken(user));

    return {
      accessToken: createAccessToken(user),
      user,
    };
  }

  @Mutation(() => Boolean)
  async revokeRefreshTokensForUser(@Arg("userId", () => Int) userId: number) {
    await getConnection()
      .getRepository(User)
      .increment({ id: userId }, "tokenVersion", 1);
    return true;
  }
  @Mutation(() => Boolean)
  async Logout(@Ctx() { res }: MyContext) {
    sendRefreshToken(res, "");
    return true;
  }
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async addClassesToUser(
    @Arg("className") className: string,
    @Ctx() { payload }: MyContext
  ) {
    if (!payload) {
      throw new Error("More internal errors");
    }
    const user = await User.findOne({
      where: { id: payload.userId },
      relations: ["classes"],
    });
    const clas = await Classes.findOne({ where: { name: className } });

    if (!user || !clas) {
      throw new Error("There are some internal errors.");
    }
    let listofAllClasses: Classes[];
    if (!user.classes) {
      listofAllClasses = new Array(1);
    } else {
      listofAllClasses = user.classes;
    }
    for (let index = 0; index < listofAllClasses.length; index++) {
      const element = listofAllClasses[index];
      if (element.id == clas.id) {
        return false;
      }
    }

    listofAllClasses.push(clas);

    try {
      user.classes = listofAllClasses;
      user.save();
      return true;
    } catch (error) {
      console.log(error);
      throw new Error("More internal errors");
    }
  }
}
