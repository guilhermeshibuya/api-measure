import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export async function confirmMeasure(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/confirm',
    {
      schema: {
        body: z.object({
          measure_uuid: z
            .string({ message: 'O id da medição deve ser uma string uuid' })
            .uuid({ message: 'O id da medição deve ser uma string uuid' }),
          confirmed_value: z
            .number({
              message: 'O valor a ser confirmado deve ser um número inteiro',
            })
            .int({
              message: 'O valor a ser confirmado deve ser um número inteiro',
            }),
        }),
      },
    },
    async (request, reply) => {},
  )
}
