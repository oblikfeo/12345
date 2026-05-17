FROM php:8.2-fpm

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libwebp-dev \
    libtiff-dev \
    libzip-dev \
    libmagickwand-dev \
    imagemagick \
    zip \
    unzip \
    git \
    curl \
    build-essential \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Настройка GD
RUN docker-php-ext-configure gd \
    --with-freetype \
    --with-jpeg \
    --with-webp

RUN docker-php-ext-install -j$(nproc) \
    gd \
    mysqli \
    pdo \
    pdo_mysql \
    zip

# Установка Imagick через PECL (актуальная версия для PHP 8.2)
RUN pecl install imagick \
    && docker-php-ext-enable imagick

# Проверка
RUN php -m | grep -E "imagick|gd|pdo_mysql|mysqli"
