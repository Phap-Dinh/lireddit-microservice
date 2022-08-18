import { Post } from '../../entities/Post'

export async function resolvePostReference(reference: Pick<Post, "id">): Promise<Post | undefined> {
  return Post.findOne({ where: { id: reference.id } })
}
