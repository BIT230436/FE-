# Giai đoạn 1: Build (Tạo các file JS/CSS đã tối ưu)
FROM node:20-alpine as builder
WORKDIR /app

# Sao chép package.json và cài đặt dependencies
COPY package.json package-lock.json ./
RUN npm install

# Sao chép code và build
COPY . .
# Chạy lệnh build của React
RUN npm run build 

# Giai đoạn 2: Phục vụ (Sử dụng Nginx)
FROM nginx:stable-alpine
# Xóa cấu hình mặc định của Nginx
RUN rm -rf /usr/share/nginx/html/*

# Sao chép output build từ giai đoạn 1 vào thư mục của Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Nếu bạn có cấu hình Nginx tùy chỉnh, hãy copy vào đây
# COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]