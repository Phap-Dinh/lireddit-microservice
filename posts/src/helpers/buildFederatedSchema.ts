import gql from 'graphql-tag'
import { specifiedDirectives } from 'graphql'
import { knownSubgraphDirectives as federationDirectives} from '@apollo/subgraph/dist/directives'
import { GraphQLResolverMap } from 'apollo-graphql'
import { buildSchema, BuildSchemaOptions, createResolversMap } from 'type-graphql'
import { 
  printSubgraphSchema as printSchema, 
  buildSubgraphSchema as buildApolloFederationSchema 
} from '@apollo/subgraph'

export async function buildFederatedSchema(
  options: Omit<BuildSchemaOptions, "skipCheck">,
  referenceResolvers?: GraphQLResolverMap<any>,
) {
  const schema = await buildSchema({
    ...options,
    directives: [...specifiedDirectives, ...federationDirectives, ...(options.directives || [])],
    skipCheck: true,
  })

  const typeDefs = gql(printSchema(schema))
  const resolvers = createResolversMap(schema)

  if (referenceResolvers) {
    Object.entries(referenceResolvers).filter(([key, value]) => {
      if (resolvers[key]) {
        resolvers[key] = { ...resolvers[key], ...value} as any
      } else {
        resolvers[key] = value
      }
    })
  }

  const federatedSchema = buildApolloFederationSchema({
    typeDefs: typeDefs as any,
    resolvers: resolvers as any
  })

  return federatedSchema
}

// import gql from 'graphql-tag'
// import { specifiedDirectives } from 'graphql'
// import { knownSubgraphDirectives as federationDirectives} from '@apollo/subgraph/dist/directives'
// import { GraphQLResolverMap } from 'apollo-graphql'
// import { buildSchema, BuildSchemaOptions, createResolversMap } from 'type-graphql'
// import { 
//   printSubgraphSchema as printSchema, 
//   buildSubgraphSchema as buildApolloFederationSchema 
// } from '@apollo/subgraph'

// export async function buildFederatedSchema(
//   options: Omit<BuildSchemaOptions, "skipCheck">,
//   referenceResolvers?: GraphQLResolverMap<any>,
// ) {
//   const schema = await buildSchema({
//     ...options,
//     directives: [...specifiedDirectives, ...federationDirectives, ...(options.directives || [])],
//     skipCheck: true,
//   })

//   const typeDefs = gql(printSchema(schema))
//   const resolvers = createResolversMap(schema)

//   if (referenceResolvers) {
//     Object.entries(referenceResolvers).filter(([key, value]) => {
//       resolvers[key] = { ...resolvers[key], ...value} as any
//     })
//   }

//   const federatedSchema = buildApolloFederationSchema({
//     typeDefs: typeDefs as any,
//     resolvers: resolvers as any
//   })

//   return federatedSchema
// }

// import gql from 'graphql-tag'
// import { specifiedDirectives } from 'graphql'
// import { knownSubgraphDirectives as federationDirectives} from '@apollo/subgraph/dist/directives'
// import { GraphQLResolverMap } from 'apollo-graphql'
// import { buildSchema, BuildSchemaOptions, createResolversMap } from 'type-graphql'
// import { 
//   printSubgraphSchema as printSchema, 
//   buildSubgraphSchema as buildApolloFederationSchema 
// } from '@apollo/subgraph'

// export async function buildFederatedSchema(
//   options: Omit<BuildSchemaOptions, "skipCheck">,
//   referenceResolvers?: GraphQLResolverMap<any>,
// ) {
//   const schema = await buildSchema({
//     ...options,
//     directives: [...specifiedDirectives, ...federationDirectives, ...(options.directives || [])],
//     skipCheck: true,
//   })

//   const federatedSchema = buildApolloFederationSchema({
//     typeDefs: gql(printSchema(schema)),
//     resolvers: createResolversMap(schema) as any,
//   })

 
//   if (referenceResolvers) {
//     // addResolversToSchema(federatedSchema, referenceResolvers)
    
//   }
//   return federatedSchema
// }
