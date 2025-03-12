FROM node:20
WORKDIR /AutoTag
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps
RUN npm install -g @angular/cli
RUN npm install
COPY . .
CMD ["ng", "serve", "--host", "0.0.0.0"]
