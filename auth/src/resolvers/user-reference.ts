import { User } from '../entities/User'

export async function resolveUserReference(reference: Pick<User, "id">): Promise<User | undefined> {
  return User.findOne({ where: { id: reference.id } })
}