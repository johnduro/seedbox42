FROM node:22.3.0-alpine3.19

ARG UID
ARG GID

RUN apk update
RUN apk add python3
RUN apk add make
RUN apk add g++
RUN apk add shadow

RUN usermod -u "${UID}" node
RUN groupmod -g "${GID}" node

RUN mkdir -p /opt/app
WORKDIR /opt/app
RUN chown -R node:node /opt/app

USER node

COPY --chown=node:node ./package.json ./package-lock.json ./

#COPY src/ .

#COPY src/package.json  .
RUN npm install

COPY --chown=node:node . .

#COPY src/ .


EXPOSE 3000
# CMD [ "npm", "start"]




################## AVEC BUILD STAGES


#FROM node:22.3.0-alpine3.19 AS builder

#ARG UID
#ARG GID

#RUN apk update
#RUN apk add python3 make g++ shadow

#RUN usermod -u "${UID}" node
#RUN groupmod -g "${GID}" node

#WORKDIR /opt/app
#COPY src/package.json .
#RUN npm install
#COPY src/ .

#FROM node:22.3.0-alpine3.19

#WORKDIR /opt/app
#COPY --from=builder /opt/app .

#EXPOSE 3000
#CMD [ "npm", "start"]