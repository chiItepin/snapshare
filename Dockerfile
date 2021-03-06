FROM node:14 as prod

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Copying rest of the application to app directory
COPY . .

ENV NODE_ENV=production

RUN npm run build

CMD npm run start-prod
