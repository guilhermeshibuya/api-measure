FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npx prima migrate dev --name init

RUN npm run seed

EXPOSE 3333

CMD ["npm", "run", "dev"]