# Sử dụng Maven để build toàn bộ project
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy toàn bộ mã nguồn của backend (gồm các module)
COPY . .

# Build dự án (bỏ qua tests để build nhanh hơn)
RUN mvn clean package -DskipTests

# Môi trường chạy JRE cho Spring Boot
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy file jar từ module ecc-bootstrap (nơi chứa Spring Boot main class)
COPY --from=builder /app/ecc-bootstrap/target/ecc-bootstrap-*.jar app.jar

EXPOSE 8080

# Chạy ứng dụng Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]
