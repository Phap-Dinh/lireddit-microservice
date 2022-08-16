import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql'
import argon2 from 'argon2'
import { getConnection } from 'typeorm'
import { v4 } from 'uuid'

import { User } from '../entities/User'
import { UserResponse, UsernamePasswordInput } from './types'
import { validateRegister } from '../utils/validateRegister'
import { MyContext } from '../context'
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants'
import { sendEmail } from '../utils/sendEmail'

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(
    @Root() user: User,
    @Ctx() { req }: MyContext
  ): String {
    
    // show their email for the current user
    if (req.session.userId === user.id) {
      return user.email
    }

    // user doesn't see any other's email
    return ""
  }

  @Query(() => [User!]!)
  users(): Promise<User[]> {

    return User.find()
  }

  @Query(() => User, { nullable: true })
  me(
    @Ctx() { req }: MyContext
  ): Promise<User | undefined> | null {

    // user doesn't log in/ register
    if (!req.session.userId) {
      return null
    }

    return User.findOne({ where: { id: req.session.userId }})
  }

  // should add Promise<UserResponse> because Typescript supports the hint return types
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {

    // validate for register's input
    const errors = validateRegister(options)
    if (errors) { 
      return { errors }
    }

    // create a new user
    const hashedPassword = await argon2.hash(options.password)
    let user 
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          email: options.email,
          password: hashedPassword
        })
        .returning("*")
        .execute()

      user = result.raw[0]
    } catch (error) {
      // return errors if username and email already exist
      if (error.code === "23505") {
        if (error.detail.includes("email")) {
          return {
            errors: [
              {
                field: "email",
                message: "email already exists"
              }
           ]
          }
        } else if (error.detail.includes("username")) {
          return {
            errors: [
              {
                field: "username",
                message: "username already exists"
              }
           ]
          }
        }
      }
    }

    req.session.userId = user.id

    return { user }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {

    // find user by email or username
    const user = await User.findOne(
      usernameOrEmail.includes("@")
      ? { where: { email: usernameOrEmail } }
      : { where: { username: usernameOrEmail } }
    )
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "that usernameOrEmail doesn't exist"
          }
        ]
      }
    }

    // verify the hashed password and the password from user
    const isValid = await argon2.verify(user.password, password)
    if (!isValid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password"
          }
        ]
      }
    }

    req.session.userId = user.id

    return { user }
  }

  @Mutation(() => Boolean)
  logout(
    @Ctx() { req, res }: MyContext
  ): Promise<Boolean> {

    return new Promise((resolve) => {
      req.session.destroy((err) => {  
        if (err) {
          console.log(err);
          resolve(false)
          return
        }

        res.clearCookie(COOKIE_NAME)
        resolve(true)
      })
    })
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ): Promise<Boolean> {
    
    // find user by email
    const user = await User.findOne({ where: { email }})
    if (!user) {
      return false
    }

    // generate a  new token
    const token = v4()

    // save key and value in redis
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      'EX',
      1000 * 60 * 60 
    )

    // send a change password link to user'email
    await sendEmail(
      email,
      `<a href='http://localhost:3000/change-password/${token}'>reset password</a>`
    )

    return true
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {

    // valdate for newPassword
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "length must be greater than 2"
          }
        ]
      }
    }

    // get userId from redis
    const key = FORGET_PASSWORD_PREFIX + token
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired"
          }
        ]
      }
    }

    // get user by userId
    const userIdNum = parseInt(userId)
    const user = await User.findOne({ where: { id: userIdNum } })
    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists"
          },
        ],
      }
    }

    // update password in db
    await User.update(
      { id: userIdNum },
      {
        password: await argon2.hash(newPassword)
      }
    )

    // delete key in redis
    await redis.del(key)

    // log in after user changes password
    req.session.userId = user.id;

    return { user }
  }
}