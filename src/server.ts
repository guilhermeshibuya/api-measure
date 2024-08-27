import fastify from 'fastify'
import { env } from './env'
import { createMeasure } from './routes/measures/create-measure'

const server = fastify()

server.register(createMeasure)

server.listen({ port: env.PORT }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server is listening at ${address}`)
})
