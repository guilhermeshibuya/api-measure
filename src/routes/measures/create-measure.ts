import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export async function createMeasure(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/upload',
    {
      schema: {
        body: z.object({
          image: z.string().base64(),
          customer_code: z.string(),
          measure_datetime: z.coerce.date(),
          measure_type: z.enum(['WATER', 'GAS']),
        }),
      },
    },
    async (request, reply) => {
      const { image, customer_code, measure_datetime, measure_type } =
        request.body

      reply.code(200).send({ message: 'funcionou' })
    },
  )
}
