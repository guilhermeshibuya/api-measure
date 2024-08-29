import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { getMeasuresByCustomerOptions } from './routes-options'
import { prisma } from '../../lib/prisma'
import { ERROR_MESSAGES } from '../../utils/error-messages'

const querySchema = z.object({
  measure_type: z
    .enum(['WATER', 'GAS'], {
      message: 'O tipo de medição deve ser "WATER" ou "GAS"',
    })
    .optional(),
})

export async function getMeasureByCustomer(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/:customer_code/list',
      getMeasuresByCustomerOptions,
      async (request, reply) => {
        try {
          const { measure_type } = request.query
          const { customer_code } = request.params

          const measures = await prisma.measure.findMany({
            where: {
              customer_code,
              measure_type,
            },
          })

          if (measures.length === 0) {
            return reply.code(404).send(ERROR_MESSAGES.MEASURES_NOT_FOUND)
          }

          return {
            customer_code,
            measures: measures.map((measure) => {
              const {
                measure_uuid,
                measure_datetime,
                measure_type,
                has_confirmed,
                image_url,
              } = measure
              return {
                measure_uuid,
                measure_datetime,
                measure_type,
                has_confirmed,
                image_url,
              }
            }),
          }
        } catch (err: unknown) {
          return reply.code(500).send(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
        }
      },
    )
}
