import { z } from 'zod'

export const confirmMeasureOptions = {
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
}

export const createMeasureOptions = {
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
}

export const getMeasuresByCustomerOptions = {
  schema: {
    params: z.object({
      customer_code: z
        .string({ message: 'O id do cliente deve ser uma string uuid' })
        .uuid({ message: 'O id do cliente deve ser uma string uuid' }),
    }),
    querystring: z.object({
      measure_type: z
        .string()
        .transform((value) => value.toUpperCase())
        .refine((value) => ['WATER', 'GAS'].includes(value), {
          message: 'O tipo de medição deve ser "WATER" ou "GAS"',
        })
        .optional(),
    }),
  },
}
