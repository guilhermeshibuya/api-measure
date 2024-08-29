import fastify from 'fastify'
import { env } from './env'
import { createMeasure } from './routes/measures/create-measure'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { errorHandler } from './error-handler'
import { confirmMeasure } from './routes/measures/confirm-measure'
import { getMeasureByCustomer } from './routes/measures/get-measures-by-customer'
import cors from '@fastify/cors'

const server = fastify()

server.register(cors, {
  origin: '*',
})

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.setErrorHandler(errorHandler)

server.register(createMeasure)
server.register(confirmMeasure)
server.register(getMeasureByCustomer)

server.listen({ port: 3333, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server is listening at ${address}`)
})
