#!/bin/bash
# 필요한 패키지 설치 스크립트

cd "$(dirname "$0")"

echo "필요한 패키지를 설치합니다..."

npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install --save-dev @types/passport-jwt @types/bcrypt

echo "설치 완료!"

