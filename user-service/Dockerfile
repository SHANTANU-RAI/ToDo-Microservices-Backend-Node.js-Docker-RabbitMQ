FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8000
CMD ["node", "index.js"]
# define step by step command to create docker image for user-service
# we do not want to copyu node modules and package lock json to be in our image so we will delete them.