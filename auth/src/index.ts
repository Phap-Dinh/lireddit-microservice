import 'reflect-metadata'
import { ApolloServer } from 'apollo-server-express'
import { createConnection } from 'typeorm'

import { app, redisClient } from './app'
import { User } from './entities/User'
import { UserResolver } from './resolvers/user'
import { AUTH_PORT } from './constants'
import { buildFederatedSchema } from './helpers/buildFederatedSchema'
import { resolveUserReference } from './resolvers/user/reference'

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
    entities: [User]
 })

  const schema = await buildFederatedSchema(
    {
      resolvers: [UserResolver],
      orphanedTypes: [User]
    },
    {
      User: { __resolveReference: resolveUserReference}
    }
  )

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }) => ({
      req,
      res, 
      redis: redisClient
    })
  })

  await apolloServer.start()
  apolloServer.applyMiddleware({
    app,
    cors: false
  })

  app.listen(AUTH_PORT, () => {
    console.log(`Server started on http://localhost:${AUTH_PORT}`)
    console.log(`Graphql started on http://localhost:${AUTH_PORT}${apolloServer.graphqlPath}`)
  })
}

start().catch((error) => {
  console.error(error)
})
