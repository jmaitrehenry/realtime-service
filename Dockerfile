FROM node:9-alpine

RUN mkdir /code && chown node. /code

USER node
WORKDIR /code
EXPOSE 5000

COPY --chown=node:node . /code
RUN npm install

CMD npm start
