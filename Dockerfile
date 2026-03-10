FROM node:20-alpine

# Set non-root user for security
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate Drizzle migration and run build
RUN npm run build
RUN npx drizzle-kit generate

# Hardening: Run as non-privileged user
RUN chown -R node:node /app
USER node

EXPOSE 3000

CMD ["npx", "tsx", "server.ts"]