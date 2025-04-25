FROM node:18
# set working directory
WORKDIR /app
# copy package files and install dependencies 
COPY package.json package-lock.json ./
RUN npm install
# copy entire project 
COPY . .

# Creating and setting correct permissions for uploads directory
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads
# non-root user for better security
USER node
# run the app
CMD ["node", "src/index.js"]