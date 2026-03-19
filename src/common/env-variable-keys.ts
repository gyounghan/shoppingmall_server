export const envVariableKeys = {
  // Database
  dbType: 'DB_TYPE',
  dbHost: 'DB_HOST',
  dbPort: 'DB_PORT',
  dbUsername: 'DB_USERNAME',
  dbPassword: 'DB_PASSWORD',
  dbDatabase: 'DB_DATABASE',

  // Server
  port: 'PORT',
  nodeEnv: 'NODE_ENV',

  // CORS
  corsOrigin: 'CORS_ORIGIN',

  // JWT
  jwtSecret: 'JWT_SECRET',
  jwtAccessExpires: 'JWT_ACCESS_EXPIRES',
  jwtRefreshExpires: 'JWT_REFRESH_EXPIRES',
} as const;

