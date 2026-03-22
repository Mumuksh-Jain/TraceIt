FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json 
COPY package*.json ./
# RUN — build time (installing packages)
RUN npm ci --only=production
# Copy app code
COPY . .

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]