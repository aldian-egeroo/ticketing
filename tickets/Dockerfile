FROM node:16-alpine

WORKDIR /app
COPY package.json /app
RUN npm install --only=prod

COPY . /app

CMD ["npm", "start"]