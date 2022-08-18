import 'reflect-metadata'
import { ApolloServer } from 'apollo-server-express'
import { createConnection } from 'typeorm'

import { app } from './app'
import { POSTS_PORT } from './constants'
import { Post } from './entities/Post'
import { PostResolver } from './resolvers/post'
import { buildFederatedSchema } from './helpers/buildFederatedSchema'
import { resolvePostReference } from './resolvers/post/reference'
import { User } from './entities/User'
import { UserPostsResolver } from './resolvers/user'

const start = async () => {
  await createConnection({
    type: "postgres",
    host: "localhost",
    port: 5432,
    database: "lireddit2",
    username: "postgres",
    password: "1",
    logging: false, 
    synchronize: true,
    entities: [Post]
 })

  const schema = await buildFederatedSchema(
    {
      resolvers: [PostResolver, UserPostsResolver],
      orphanedTypes: [Post, User]
    },
    {
      Post: { __resolveReference: resolvePostReference }
    }
  )

  // const schema = await buildSchema({
  //   resolvers: [PostResolver],
  //   validate: false
  // })

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }) => ({
      req,
      res
    })
  })

  await apolloServer.start()
  apolloServer.applyMiddleware({
    app,
    // cors: false
  })

  app.listen(POSTS_PORT, () => {
    console.log(`Server started on http://localhost:${POSTS_PORT}`)
    console.log(`Graphql started on http://localhost:${POSTS_PORT}${apolloServer.graphqlPath}`)
  })
}

start().catch((error) => {
  console.error(error)
})
