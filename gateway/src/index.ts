import 'reflect-metadata'
import { 
  ApolloGateway, 
  GraphQLDataSourceProcessOptions, 
  IntrospectAndCompose, 
  RemoteGraphQLDataSource
} from '@apollo/gateway'
import { 
  GraphQLRequestContext, 
  GraphQLRequestContextWillSendResponse, 
  GraphQLResponse, 
  ValueOrPromise 
} from 'apollo-server-types'
import { GraphQLRequestListener } from 'apollo-server-plugin-base'
import { ApolloServer } from 'apollo-server-express'

import { app } from './app'
import { GATEWAY_PORT } from './constants'
import { MyContext } from './context'

class CookieDataSource extends RemoteGraphQLDataSource<MyContext> {
  // custom request before it's sent to subgraph
  willSendRequest(
    { request, context }: GraphQLDataSourceProcessOptions<MyContext>
  ): ValueOrPromise<void> {

    const { xForwardedProto, mycookie } = (context as MyContext)

    if (xForwardedProto) {
      request.http?.headers.set("x-forwarded-proto", xForwardedProto)
    }

    if (mycookie) {
      request.http?.headers.set("cookie", mycookie)
    }
  }

  // receive response from subgraph
  didReceiveResponse(
    { response, context }: Required<
      Pick<GraphQLRequestContext<MyContext>, "response" | "context">
    >
  ): ValueOrPromise<GraphQLResponse>{

    const rawCookies = response.http?.headers.get('set-cookie')

    if (rawCookies) {
      context.mycookie = rawCookies
    }
  
    return response
  }
}

const start = async () => {
  const subgraphs = [
    { name: "users", url: "http://localhost:4001/graphql" },
    { name: "posts", url: "http://localhost:4002/graphql" }
  ]

  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs
    }),
    buildService({ url }) {
      return new CookieDataSource({ url })
    }
  })

  const apolloServer = new ApolloServer({
    gateway,
    context: ({ req }) => ({ 
      xForwardedProto: req.headers["x-forwarded-proto"],
      mycookie: req.headers["cookie"]
    }),
    plugins: [
      {
        async requestDidStart():  Promise<void | GraphQLRequestListener<MyContext>> {
          return {
            async willSendResponse(
              { response, context }: GraphQLRequestContextWillSendResponse<MyContext>
            ): Promise<void> {
              response.http?.headers.set("set-cookie", context.mycookie)
            }
          }
        }
      }
    ]
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
