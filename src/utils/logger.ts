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

type TInfo = {
  level: string
  message: string
  timestamp: string
  meta?: { [key: string]: unknown }
}

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
  const { level, message, timestamp, meta = {} } = info as TInfo

  const customLevel = colorizeLevel(level.toUpperCase())
  const customTimeStamp = green(timestamp)
  const customMessage = message
  const customMeta = util.inspect(meta, {
    showHidden: false,
    depth: null,
    colors: true
  })

  let logMsg = `\n${customLevel} ${customMessage}\n${dim('TIME')} ${dim(
    customTimeStamp
  )}`
  if (Object.keys(meta).length !== 0) {
    logMsg = `${logMsg}\n${magenta('META')} ${customMeta}`
  }

  return logMsg
})

const fileLogFormat = format.printf((info) => {
  const { level, message, timestamp, meta = {} } = info as TInfo

  const logMeta: Record<string, unknown> = {}

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
    message,
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
