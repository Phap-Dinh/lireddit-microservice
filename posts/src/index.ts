import 'reflect-metadata'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { createConnection } from 'typeorm'

import { app } from './app'
import { POSTS_PORT } from './constants'
import { HelloResolver } from './resolvers/hello'
import { Post } from './entities/Post'
import { PostResolver } from './resolvers/post'

const start = async () => {
  await createConnection({
    type: "postgres",
    host: "localhost",
    port: 5432,
    database: "lireddit2",
    username: "postgres",
    password: "1",
    logging: true, 
    synchronize: true,
    entities: [Post]
 })

  const schema = await buildSchema({
    resolvers: [HelloResolver, PostResolver],
    validate: false
  })

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
    console.log(`Graphql started on http://localhost:${POSTS_PORT}/graphql`)
  })
}

start().catch((error) => {
  console.error(error)
})
