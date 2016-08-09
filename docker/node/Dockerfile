FROM node:argon

RUN mkdir /app-src

WORKDIR /app-src

RUN npm install nodemon -g

COPY . /app-src

RUN npm install

#CMD nodemon app.js
