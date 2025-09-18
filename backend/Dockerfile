# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev --production

# Install TypeScript for build (temporarily)
RUN npm install --save-dev typescript

# Copy source code
COPY . .

# Build the TypeScript project
RUN npm run build

# Remove TypeScript after build to reduce image size
RUN npm uninstall typescript

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]