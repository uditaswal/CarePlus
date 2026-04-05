# Use official Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Use secrets (Next.js will read from .env during build)
RUN --mount=type=secret,id=env_file,dst=/app/_env_build \
    cp /app/_env_build .env.local && \
    npm run build
    
# Expose the port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
