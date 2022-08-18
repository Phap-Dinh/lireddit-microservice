import { Directive, Field, Int, ObjectType } from 'type-graphql'

@Directive("@extends")
@Directive(`@key(fields: "id")`)
@ObjectType()
export class User {
  @Directive("@external")
  @Field(() => Int)
  id: number
}
