import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { prisma } from '../../lib/prisma'
import { startOfMonth, endOfMonth } from 'date-fns'
import { aiFileManager, geminiModel } from '../../lib/gemini'
import { unlinkSync, writeFileSync } from 'fs'
import path = require('path')
import { createMeasureOptions } from './routes-options'
import { ERROR_MESSAGES } from '../../utils/error-messages'

function processImageAndGeneratePath(base64Image: string) {
  const imageBuffer = Buffer.from(base64Image, 'base64')
  const imageName = 'image.jpeg'
  const imageDir = path.resolve(__dirname, '../../..')
  const imagePath = path.join(imageDir, imageName)

  writeFileSync(imagePath, imageBuffer)

  return { imagePath }
}

async function getContentFromGemini({
  imagePath,
  measureType,
}: {
  imagePath: string
  measureType: 'WATER' | 'GAS'
}) {
  const uploadResponse = await aiFileManager.uploadFile(imagePath, {
    mimeType: 'image/jpeg',
    displayName: 'Measure image',
  })

  const promptMeasureType = measureType === 'WATER' ? 'água' : 'gás'
  const prompt = `A seguinte imagem é uma conta de ${promptMeasureType}, quero que identifique o consumo de ${promptMeasureType} do mês em m3, provavelmente um valor inteiro e quero que me retorne apenas o valor numérico na mensagem.`

  const result = await geminiModel.generateContent([
    {
      fileData: {
        mimeType: uploadResponse.file.mimeType,
        fileUri: uploadResponse.file.uri,
      },
    },
    {
      text: prompt,
    },
  ])

  const measureValue = Number(result.response.text())
  const intMeasureValue = Number.isInteger(measureValue)
    ? measureValue
    : Math.round(measureValue)

  return { measureValue: intMeasureValue, fileUri: uploadResponse.file.uri }
}

export async function createMeasure(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/upload', createMeasureOptions, async (request, reply) => {
      try {
        const { image, customer_code, measure_datetime, measure_type } =
          request.body

        const startDate = startOfMonth(measure_datetime)
        const endDate = endOfMonth(measure_datetime)

        const existingMeasure = await prisma.measure.findFirst({
          where: {
            customer: {
              customer_code,
            },
            measure_type,
            measure_datetime: {
              gte: startDate,
              lte: endDate,
            },
          },
        })

        if (existingMeasure) {
          return reply.code(409).send(ERROR_MESSAGES.DOUBLE_REPORT)
        }

        const customer = await prisma.customer.findUnique({
          where: {
            customer_code,
          },
        })

        if (!customer) {
          return reply.code(404).send(ERROR_MESSAGES.CUSTOMER_NOT_FOUND)
        }

        const { imagePath } = processImageAndGeneratePath(image)

        const { measureValue, fileUri } = await getContentFromGemini({
          imagePath,
          measureType: measure_type,
        })

        const newMeasure = await prisma.measure.create({
          data: {
            measure_datetime,
            measure_type,
            image_url: fileUri,
            customer_code: customer.customer_code,
            value: measureValue,
          },
        })

        unlinkSync(imagePath)

        return reply.code(200).send({
          image_url: newMeasure.image_url,
          measure_value: measureValue,
          measure_uuid: newMeasure.measure_uuid,
        })
      } catch (err: unknown) {
        return reply.code(500).send(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
      }
    })
}
