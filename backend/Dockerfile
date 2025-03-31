FROM node:18
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .

# Creating and setting correct permissions for uploads directory
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads
USER node

CMD ["node", "src/index.js"]