import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

export function createWinstonConfig(nodeEnv: string): WinstonModuleOptions {
  const isDevelopment = nodeEnv !== 'production';

  const devFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: false, level: true }),
    winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
      const ctx = context ? `[${context}] ` : '';
      const metaStr =
        Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
      return `${timestamp} ${level.padEnd(7)} ${ctx}${message}${metaStr}`;
    }),
  );

  const prodFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  );

  return {
    transports: [
      new winston.transports.Console({
        format: isDevelopment ? devFormat : prodFormat,
      }),
    ],
  };
}
