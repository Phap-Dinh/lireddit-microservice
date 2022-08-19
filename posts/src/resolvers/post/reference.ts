import { Post } from '../../entities/Post'

export function resolvePostReference(reference: Pick<Post, "id">): Promise<Post | undefined> {
  return Post.findOne({ where: { id: reference.id } })
}
