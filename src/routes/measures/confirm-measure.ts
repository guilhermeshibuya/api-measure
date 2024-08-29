import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { prisma } from '../../lib/prisma'
import { confirmMeasureOptions } from './routes-options'
import { ERROR_MESSAGES } from '../../utils/error-messages'

export async function confirmMeasure(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .patch('/confirm', confirmMeasureOptions, async (request, reply) => {
      try {
        const { measure_uuid, confirmed_value } = request.body

        const measure = await prisma.measure.findUnique({
          where: {
            measure_uuid,
          },
        })

        if (!measure) {
          return reply.code(404).send(ERROR_MESSAGES.MEASURE_NOT_FOUND)
        }

        if (measure.has_confirmed) {
          return reply.code(409).send(ERROR_MESSAGES.CONFIRMATION_DUPLICATE)
        }

        await prisma.measure.update({
          where: {
            measure_uuid,
          },
          data: {
            has_confirmed: true,
            value: confirmed_value,
          },
        })

        return reply.code(200).send({
          success: true,
        })
      } catch (err: unknown) {
        return reply.code(500).send(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
      }
    })
}
