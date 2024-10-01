import { blue, dim, green, magenta, red, yellow } from 'colorette'
import path from 'path'
import * as sourceMapSupport from 'source-map-support'
import util from 'util'
import { createLogger, format, transports } from 'winston'
import 'winston-mongodb'
import { MongoDBTransportInstance } from 'winston-mongodb'
import {
  ConsoleTransportInstance,
  FileTransportInstance
} from 'winston/lib/winston/transports'
import config from '../config'

sourceMapSupport.install()

const colorizeLevel = (level: string) => {
  switch (level) {
    case 'ERROR':
      return red(level)
    case 'INFO':
      return blue(level)
    case 'WARN':
      return yellow(level)
    default:
      return level
  }
}

const consoleLogFormat = format.printf((info) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { level, message, timestamp, meta = {} } = info

  const customLevel = colorizeLevel(level.toUpperCase())
  const customTimeStamp = green(timestamp as string)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const customMessage = message
  const customMeta = util.inspect(meta, {
    showHidden: false,
    depth: null,
    colors: true
  })

  return `${customLevel} ${customMessage} ${dim(customTimeStamp)}\n${magenta(
    'META'
  )} ${customMeta}\n`
})

const fileLogFormat = format.printf((info) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { level, message, timestamp, meta = {} } = info

  const logMeta: Record<string, unknown> = {}

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  for (const [key, value] of Object.entries(meta)) {
    if (value instanceof Error) {
      logMeta[key] = {
        name: value.name,
        message: value.message,
        trace: value.stack
      }
    } else {
      logMeta[key] = value
    }
  }

  const logData = {
    level: level.toUpperCase(),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    message,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    timestamp,
    meta: logMeta
  }

  return JSON.stringify(logData, null, 4)
})

const consoleTransport = (): Array<ConsoleTransportInstance> => {
  if (config.IN_DEV) {
    return [
      new transports.Console({
        level: 'info',
        format: format.combine(format.timestamp(), consoleLogFormat)
      })
    ]
  }

  return []
}

const fileTransport = (): Array<FileTransportInstance> => {
  return [
    new transports.File({
      filename: path.join(__dirname, '../', '../', 'logs', `${config.ENV}.log`),
      level: 'info',
      format: format.combine(format.timestamp(), fileLogFormat)
    })
  ]
}

const mongoDbTransport = (): Array<MongoDBTransportInstance> => {
  return [
    new transports.MongoDB({
      level: 'info',
      db: config.DATABASE_URL,
      options: { useUnifiedTopology: true },
      metaKey: 'meta',
      expireAfterSeconds: 3600 * 24 * 30,
      collection: 'application-logs'
    })
  ]
}

export default createLogger({
  defaultMeta: {
    meta: {}
  },
  transports: [...fileTransport(), ...mongoDbTransport(), ...consoleTransport()]
})
