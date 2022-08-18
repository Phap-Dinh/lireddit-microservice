import 'reflect-metadata'
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway'
import { ApolloServer } from 'apollo-server-express'

import { app } from './app'
import { GATEWAY_PORT } from './constants'

const start = async () => {
  const subgraphs = [
    { name: "users", url: "http://localhost:4001/graphql" },
    { name: "posts", url: "http://localhost:4002/graphql" }
  ]

  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs
    })
  })

  const apolloServer = new ApolloServer({
    gateway
  })

  await apolloServer.start()
  apolloServer.applyMiddleware({ 
    app,
    cors: false
  })

  app.listen({ port: GATEWAY_PORT }, () => {
    console.log(
      `Apollo Gateway ready at http://localhost:${GATEWAY_PORT}${apolloServer.graphqlPath}`
    )
  })

}

start().catch(console.error)
