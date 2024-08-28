import { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (error instanceof ZodError) {
    const errors = error.errors.map((err) => err.message).join(', ')
    return reply.status(400).send({
      message: 'INVALID_DATA',
      error_description: `Dados inválidos: ${errors}`,
    })
  }
}
