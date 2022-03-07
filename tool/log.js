const CONFIG = require('../tool/config').getConfig()

const log4js = require('log4js')
log4js.configure({
  appenders: {
    out: { type: 'stdout' },
    app: { 
      'type': 'dateFile', 
      'filename': CONFIG.APP_LOG_PATH, 
      'pattern': '-yyyy-MM-dd',
      'backups': CONFIG.APP_LOG_BACKUPS,
      'compress': true
    },
    error: { 
      'type': 'dateFile', 
      'filename': CONFIG.ERROR_LOG_PATH, 
      'pattern': '-yyyy-MM-dd',
      'backups': CONFIG.ERROR_LOG_BACKUPS,
      'compress': true
    },
    learning: { 
      'type': 'dateFile', 
      'filename': CONFIG.LEARNING_LOG_PATH, 
      'pattern': '-yyyy-MM-dd',
      'backups': CONFIG.LEARNING_LOG_BACKUPS,
      'compress': true
    }
  },
  categories: {
    default: { appenders: ['out'], level: 'all' },
    app: { appenders: ['app'], level: 'debug' },
    error: { appenders: ['error'], level: 'debug' },
    learning: { appenders: ['learning'], level: 'info' },
  }
})

const loggerDefault = log4js.getLogger()
const loggerApp = log4js.getLogger('app')
const loggerError = log4js.getLogger('error')
const loggerLearning = log4js.getLogger('learning')

loggerApp.info("[SHINtube] started!!")

module.exports.default = loggerDefault
module.exports.app = loggerApp
module.exports.error = loggerError
module.exports.learning = loggerLearning