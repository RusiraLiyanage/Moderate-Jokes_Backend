FROM node:17-alpine

WORKDIR /user/src/app-backendModerate

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8050

CMD ["npm", "run", "Start"]
