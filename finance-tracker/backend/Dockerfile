FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy Prisma schema
COPY prisma ./prisma/

# Install dependencies (skipping postinstall script)
RUN npm install --ignore-scripts

# Copy source code
COPY . .

# Now run Prisma generate and build manually
RUN npx prisma generate && npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy Prisma schema
COPY prisma ./prisma/

# Install production dependencies only (skipping postinstall script)
RUN npm install --only=production --ignore-scripts

# Generate Prisma client
RUN npx prisma generate

# Copy built app from builder stage
COPY --from=builder /app/dist ./dist

# Expose API port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/main"] 