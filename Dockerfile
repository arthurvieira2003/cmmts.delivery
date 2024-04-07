FROM node:alpine
WORKDIR /usr/app
COPY ./package*.json ./
RUN npm install
RUN npm install -g ngrok
RUN ngrok config add-authtoken 2dbqhM8ZiejlUQW4xHZ3QcFRFUb_7SQcpm9wrCLGSNWyhtsdw
RUN npm install bcryptjs
RUN npm install -g nodemon
COPY . .
EXPOSE 3000
CMD ["npm" , "run", "start"]