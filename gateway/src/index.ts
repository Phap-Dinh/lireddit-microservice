import 'reflect-metadata'
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway'
import { ApolloServer } from 'apollo-server'

import { GATEWAY_PORT } from './constants'

const start = async () => {

  // Just for test, it connect to autronauts service in space-camp-federation-demo
  const subgraphs = [
    { name: "autronauts", url: "http://localhost:4001"}
  ]

  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs
    })
  })

  const server = new ApolloServer({
    gateway
  })

  server.listen({ port: GATEWAY_PORT }).then(({ url }) => {
    console.log(`Apollo Gateway ready at ${url}`)
  })
}

start().catch(console.error)