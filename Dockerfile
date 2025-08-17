# Dockerfile - for editor-backend (put in project root)
FROM node:18-bullseye

# Avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install system packages needed to compile/run student code
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    default-jre \
    default-jdk \
    python3 \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend package + code
# Adjust paths if your backend is not at ./editor-backend
COPY ./editor-backend/package*.json ./editor-backend/
COPY ./editor-backend/ ./editor-backend/

WORKDIR /app/editor-backend

# Install node deps
RUN npm install --production

# Expose port your app listens on (index.js uses PORT env or 8080)
EXPOSE 8080

# Start the server
CMD ["npm", "start"]
