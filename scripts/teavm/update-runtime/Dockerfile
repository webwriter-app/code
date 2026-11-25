FROM eclipse-temurin:25-jdk
RUN apt-get update && apt-get install -y --no-install-recommends curl unzip fontconfig \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /workspace
COPY . .
RUN chmod +x gradlew
CMD ["./gradlew", ":ui:war", "--no-daemon", "--stacktrace"]
