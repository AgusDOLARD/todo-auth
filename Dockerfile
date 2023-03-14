FROM node:19-alpine3.17

WORKDIR /app

COPY package.json ./

RUN npm install --omit=dev

COPY ./src .

CMD ["node", "/app/app.js"]