FROM node:20-alpine

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY . /app/

EXPOSE 3333

CMD ["npm", "run", "dev"]