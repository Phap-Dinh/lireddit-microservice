import express from 'express'
import cors from 'cors'

const app = express()

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

export { app }
