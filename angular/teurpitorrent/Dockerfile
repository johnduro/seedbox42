FROM node:alpine3.20 AS build

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN npm install -g @angular/cli

RUN npm install

RUN npm run build -- --configuration production

FROM nginx:alpine

COPY --from=build /usr/src/app/dist/teurpitorrent /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 4200

CMD ["nginx", "-g", "daemon off;"]

# CMD ["ng", "serve", "--poll", "2000", "--host", "0.0.0.0"]

