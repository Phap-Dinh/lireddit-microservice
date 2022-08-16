import cors from 'cors'
import express from 'express'
import session from 'express-session'
import Redis from 'ioredis'

import { COOKIE_NAME, SESSION_SECRET } from './constants'

const app = express()
const RedisStore = require("connect-redis")(session)
const redisClient = new Redis()

app.set("trust proxy", true)
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:4000/graphql", 
      "https://studio.apollographql.com"
    ],
    credentials: true
  })
)

app.use(session({
  name: COOKIE_NAME,
  store: new RedisStore({
    client: redisClient,
    disableTouch: true
  }), 
  cookie: { 
    maxAge: 1000 * 60 * 60, 
    httpOnly: true,
    sameSite: "none",
    secure: true
  },
  saveUninitialized: true, 
  secret: SESSION_SECRET, 
  resave: false,
}))

export { app, redisClient }
