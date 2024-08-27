import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager } from '@google/generative-ai/server'
import { env } from '../env'

const genAi = new GoogleGenerativeAI(env.GEMINI_API_KEY)

export const geminiModel = genAi.getGenerativeModel({
  model: 'gemini-1.5-pro',
})

export const aiFileManager = new GoogleAIFileManager(env.GEMINI_API_KEY)
