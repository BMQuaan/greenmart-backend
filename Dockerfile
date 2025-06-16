# Dùng image Node chính thức
FROM node:18-alpine

# Tạo thư mục app trong container
WORKDIR /app

# Copy file cấu hình trước để cache install
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Build TypeScript sang JavaScript
RUN npm run build

# Expose cổng mà app sẽ chạy 
EXPOSE 3000

# Chạy ứng dụng
CMD ["node", "dist/index.js"]
