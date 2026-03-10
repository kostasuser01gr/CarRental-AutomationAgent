FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate Drizzle migration and run build
RUN npm run build
RUN npx drizzle-kit generate

EXPOSE 3000

CMD ["npx", "tsx", "server.ts"]