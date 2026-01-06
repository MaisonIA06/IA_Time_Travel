FROM node:20-slim

WORKDIR /app

# Install dependencies - only copy package.json to avoid architecture issues
COPY package.json ./

# Clean install with optional dependencies for current platform
RUN npm install --legacy-peer-deps && \
    npm rebuild

# Copy project files
COPY . .

EXPOSE 5173

# Run Vite dev server with host flag to allow external connections
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

