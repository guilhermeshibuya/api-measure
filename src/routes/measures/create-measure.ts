import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { startOfMonth, endOfMonth } from 'date-fns'
import { aiFileManager, geminiModel } from '../../lib/gemini'
import { writeFileSync } from 'fs'
import path = require('path')

export async function createMeasure(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/upload',
    {
      bodyLimit: 1024 * 1024 * 2,
      schema: {
        body: z.object({
          image: z
            .string({
              message: 'A imagem deve ser uma string no formato base64',
            })
            .base64({
              message: 'A imagem deve ser uma string no formato base64',
            }),
          customer_code: z.string({
            message: 'O código do cliente deve ser uma string',
          }),
          measure_datetime: z.coerce.date({
            message: 'A data da medição deve ser uma data válida',
          }),
          measure_type: z.enum(['WATER', 'GAS'], {
            message: 'O tipo de medição deve ser "WATER" ou "GAS"',
          }),
        }),
      },
    },
    async (request, reply) => {
      const { image, customer_code, measure_datetime, measure_type } =
        request.body

      const startDate = startOfMonth(measure_datetime)
      const endDate = endOfMonth(measure_datetime)

      const existingMeasure = await prisma.measure.findFirst({
        where: {
          customer: { customer_code },
          measure_type,
          measure_datetime: {
            gte: startDate,
            lte: endDate,
          },
        },
      })

      if (existingMeasure) {
        return reply.code(409).send({
          error_code: 'DOUBLE_REPORT',
          error_description: 'Leitura do mês já realizada',
        })
      }

      const customer = await prisma.customer.findFirst({
        where: { customer_code },
      })

      const imageBuffer = Buffer.from(image, 'base64')
      const imageName = 'image.jpeg'
      const imageDir = path.resolve(__dirname, '../../..')
      const imagePath = path.join(imageDir, imageName)

      writeFileSync(imagePath, imageBuffer)

      const uploadResponse = await aiFileManager.uploadFile(imagePath, {
        mimeType: 'image/jpeg',
        displayName: 'Measure image',
      })

      const promptMeasureType = measure_type === 'WATER' ? 'água' : 'gás'
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

      console.log(result.response.text())
      console.log(uploadResponse.file.uri)

      const newMeasure = await prisma.measure.create({
        data: {
          measure_datetime,
          measure_type,
          image_url: uploadResponse.file.uri,
          customer_code: customer.customer_code,
        },
      })

      return reply.code(200).send({
        image_url: newMeasure.image_url,
        measure_value: Number(result.response.text()),
        measure_uuid: newMeasure.measure_uuid,
      })
    },
  )
}
