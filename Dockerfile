# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
# Use 'npm ci' for faster, more reliable builds in production
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define environment variables (PORT is already 3000 by default in server.js, but good to be explicit)
ENV PORT=3000
ENV NODE_ENV=production

# Run the application
CMD [ "node", "server.js" ]
