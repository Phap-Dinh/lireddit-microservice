# Install
  $ yarn add -D typescript @types/node ts-node nodemon
  $ npx tsconfig.json

  $ yarn add apollo-server 
  $ yarn add type-graphql reflect-metadata
  $ yarn add @apollo/subgraph@0.4.2 graphql@15.8.0 

  $ yarn add express apollo-server-express
  $ yarn add -D @types/express

  $ yarn add typeorm@0.2.25 pg
  $ yarn add argon2

  $ yarn add express-session
  $ yarn add -D @types/express-session@1.17.0

  $ yarn add ioredis connect-redis
  $ yarn add -D @types/ioredis @types/connect-redis

  $ yarn add cors

  $ yarn add uuid
  $ yarn add -D @types/uuid

  $ yarn add nodemailer
  $ yarn add -D @types/nodemailer

  $ yarn add apollo-graphql

  $ yarn add class-validator

# Include cookie on Apollo Studio
  app.set("trust proxy", true);
  app.use(
    cors({
        origin: [
          "http://localhost:3000",
          "http://localhost:4000/graphql", 
          "https://studio.apollographql.com"
        ],
        credentials: true,
    })
  );

  app.use(
    session({
      name: "qid",
      store: new RedisStore({ 
        client: redisClient,
        disableTouch: true
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "none",
        secure: true
      },
      saveUninitialized: false,
      secret: "wubsildicioc",
      resave: false
    })
  )

  apolloServer.applyMiddleware({ 
    app,
    cors: false
  });

  Apollo Studio: Settings -> Connection settings -> Edit -> Include cookies -> x-Forwarded-Proto: https

  Check cookie after login: right click -> inpect -> Application -> Cookies -> `qid`
