FROM node:20-alpine
# Best practices standard: drop root privileges
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
USER app
EXPOSE 5000
CMD ["node", "server.js"]
