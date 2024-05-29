FROM node:20.13-alpine3.19

RUN mkdir -p /usr/src/node-couchdb-api 
WORKDIR /usr/src/node-couchdb-api

COPY ../../package*.json  /usr/src/node-couchdb-api/

RUN  npm install

COPY ../../   /usr/src/node-couchdb-api 

EXPOSE 5000

CMD [ "npx", "nodemon", "app"  ]