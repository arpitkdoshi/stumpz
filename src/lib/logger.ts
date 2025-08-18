// lib/logger.ts
import { createLogger, format, transports } from 'winston'
import path from 'path'

const isDev = process.env.NODE_ENV !== 'production'

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json(), // store as JSON in file
  ),
  transports: [
    // Always log to file
    new transports.File({
      filename: path.resolve(process.cwd(), 'logs', 'app.log'),
    }),
    // Log to console only in dev
    ...(isDev
      ? [
          new transports.Console({
            format: format.combine(
              format.colorize(),
              format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
              format.printf(
                ({ level, message, timestamp, ...meta }) =>
                  `${timestamp} [${level}]: ${typeof message === 'string' ? message : JSON.stringify(message)} ${
                    Object.keys(meta).length ? JSON.stringify(meta) : ''
                  }`,
              ),
            ),
          }),
        ]
      : []),
  ],
})

export default logger
