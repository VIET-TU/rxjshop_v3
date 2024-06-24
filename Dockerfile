FROM node:18-alpine


WORKDIR /usr

COPY package*.json ./
COPY yarn*.look ./

RUN yarn install --production


COPY . .

RUN yarn build

CMD [ "yarn", "start" ]