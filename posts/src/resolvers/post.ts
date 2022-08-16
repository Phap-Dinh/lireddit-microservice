import { Arg, FieldResolver, Int, Query, Resolver, Root } from 'type-graphql'
import { getConnection } from 'typeorm';

import { PaginatedPosts } from './types';
import { Post } from '../entities/Post';

@Resolver(Post)
export class PostResolver {

  @FieldResolver(() => String)
  textSnippet(
    @Root() root: Post
  ) {
    return root.text.slice(0, 50)
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true  }) cursor: string | null    
  ): Promise<PaginatedPosts> {

    // the maximum value of limit is 50
    const realLimit = Math.min(50, limit)
    const realLimitPlusOne = realLimit + 1

    // replacements contain realLimitPlusOne and cursor
    const replacements: any[] = [realLimitPlusOne]
    if (cursor) {
      replacements.push(new Date(parseInt(cursor)))
    }

    // get all posts by realLimitPlusOne and cursor
    const posts = await getConnection().query(
      `
      select p.*
      from post p
      ${cursor ? `where p."createdAt" < $2` : ""}
      order by p."createdAt" DESC
      limit $1
      `,
      replacements
    )

    return { 
      posts: posts.slice(0, realLimit), 
      hasMore: posts.length === realLimitPlusOne 
    }
  }

  @Query(() => Post, { nullable: true })
  post(
    @Arg("id", () => Int) id: number
  ): Promise<Post | undefined> {

    return Post.findOne({ where: { id }})
  }

}