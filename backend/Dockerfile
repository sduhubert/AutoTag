FROM node:18
WORKDIR /AutoTag
COPY package.json package-lock.json ./
RUN npm install
COPY . .
CMD ["node", "src/index.js"]
