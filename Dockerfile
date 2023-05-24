# Dockerfile

FROM node:18.16.0-alpine3.17
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY package.json .
RUN npm install
RUN npm install -g sequelize-cli
RUN npm run migrate-seed
COPY / .
EXPOSE 5000
CMD [ "npm", "start"]