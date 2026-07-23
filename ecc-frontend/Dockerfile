FROM node:20-alpine

WORKDIR /app

# Copy package.json để cài đặt dependencies trước (tận dụng Docker cache)
COPY package*.json ./
RUN npm install

# Copy toàn bộ code
COPY . .

# Build ứng dụng Next.js
RUN npm run build

EXPOSE 3000

# Chạy ứng dụng production
CMD ["npm", "start"]
