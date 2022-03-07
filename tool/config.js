const app_config = require('../config/app_config.json')
const sso_config = require('../config/sso_config.json')
const lti_config = require('../config/lti_config.json')
const db_config = require('../config/db_config.json')
const backend_config = require('../config/backend_config.json')

const CONFIG = {}

const path = require("path")
const APP_ROOT = path.join(__dirname, "../")

const DB_URL = db_config.mongo_url || process.env.DB_URL || "mongo"
const DB_NAME = db_config.db_name || process.env.DB_NAME || "SHINtube"
const DB_USER = db_config.user || process.env.DB_USER || "root"
const DB_PASS = db_config.pass || process.env.DB_PASS || "pass"
CONFIG.DB_URL = DB_URL.replace("mongodb://","").split("/")[0]
CONFIG.DB_NAME = DB_NAME
CONFIG.DB_USER = DB_USER
CONFIG.DB_PASS = DB_PASS

const MY_DOMAIN = lti_config.my_domain || process.env.MY_DOMAIN || ""
const REG_KEY = lti_config.reg_key || process.env.REG_KEY || "pass1234"
CONFIG.MY_DOMAIN = MY_DOMAIN.slice(-1)[0] == "/" ? MY_DOMAIN.slice(0,-1) : MY_DOMAIN
CONFIG.REG_KEY = REG_KEY

const PORT = app_config.app_port || process.env.PORT || 3000
const ROOT_PATH = app_config.app_root_path || process.env.ROOT_PATH || "/"
const CORS = app_config.app_cors || process.env.CORS || true
CONFIG.PORT = PORT
CONFIG.ROOT_PATH = ROOT_PATH.slice(-1)[0] == "/" && ROOT_PATH.length > 1 ? ROOT_PATH.slice(0,-1) : ROOT_PATH
CONFIG.CORS = typeof(CORS) == 'boolean' ? CORS : true

const APP_LOG_PATH = app_config.app_log_path
CONFIG.APP_LOG_PATH = APP_LOG_PATH || path.join(APP_ROOT,'./logs/system/application.log')
const APP_LOG_BACKUPS = app_config.app_log_backups
CONFIG.APP_LOG_BACKUPS = APP_LOG_BACKUPS || 5

const ERROR_LOG_PATH = app_config.error_log_path
CONFIG.ERROR_LOG_PATH = ERROR_LOG_PATH || path.join(APP_ROOT,'./logs/system/error.log')
const ERROR_LOG_BACKUPS = app_config.error_log_backups
CONFIG.ERROR_LOG_BACKUPS = ERROR_LOG_BACKUPS || 5

const LEARNING_LOG_PATH = app_config.learning_log_path
CONFIG.LEARNING_LOG_PATH = LEARNING_LOG_PATH || path.join(APP_ROOT,'./logs/learning/data.log')
const LEARNING_LOG_BACKUPS = app_config.learning_log_backups
CONFIG.LEARNING_LOG_BACKUPS = LEARNING_LOG_BACKUPS || 5


const SSO_LINK = sso_config.sso_link || process.env.SSO_LINK || false
const SSO_URL = sso_config.sso_url || process.env.SSO_URL || CONFIG.MY_DOMAIN
CONFIG.SSO_LINK = typeof(SSO_LINK) == 'boolean' ? SSO_LINK : false
CONFIG.SSO_URL = SSO_URL.slice(-1)[0] == "/" && SSO_URL.length > 1 ? SSO_URL.slice(0,-1) : SSO_URL

const BACK_DOMAIN = backend_config.backend_url || process.env.BACK_DOMAIN
CONFIG.BACK_DOMAIN = BACK_DOMAIN.slice(-1)[0] == "/" && BACK_DOMAIN.length > 1 ? BACK_DOMAIN.slice(0,-1) : BACK_DOMAIN



exports.getConfig = function(){
    return CONFIG
}
