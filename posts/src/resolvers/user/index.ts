import { FieldResolver, Resolver, Root } from 'type-graphql'

import { Post } from '../../entities/Post'
import { User } from '../../entities/User'

@Resolver(User)
export class UserPostsResolver {
  @FieldResolver(() => [Post])
  posts(
    @Root() user: User
  ): Promise<Post[]> {
    return Post.find({ where: { creatorId: user.id }})
  }
}