FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3333

RUN npm run seed

CMD ["npm", "run", "dev"]