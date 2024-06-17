FROM node:22.3.0-alpine3.19
RUN apk update
RUN apk add python3
RUN apk add make
RUN apk add g++
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY src/package.json  .
RUN npm install
COPY src/ .
EXPOSE 3000
CMD [ "npm", "start"]