const express = require('express')
const path = require('path')
const fileUpload = require('express-fileupload');
const platform = require('./tool/platform')

const ltiRoutes = require('./routes/lti-routes')
const videoRoutes = require('./routes/video-routes')
const logapiRoutes = require('./routes/logapi-routes')

const db_config = require('./config/db_config.json')
const lti_config = require('./config/lti_config.json')
const app_config = require('./config/app_config.json')

const DB_URL = db_config.mongo_url || process.env.DB_URL || "mongo"
const DB_NAME = db_config.db_name || process.env.DB_NAME || "SHINtube"
const DB_USER = db_config.user || process.env.DB_USER || "root"
const DB_PASS = db_config.pass || process.env.DB_PASS || "pass"

const MY_DOMAIN = lti_config.my_domain || process.env.MY_DOMAIN || ""
const REG_KEY = lti_config.reg_key || process.env.REG_KEY || "pass1234"

const PORT = app_config.app_port || process.env.PORT || 3000
const ROOT_PATH = app_config.app_root_path || process.env.ROOT_PATH || "/"

const middleware = (app) => {
  app.use(path.join('/', ROOT_PATH), express.static(path.join(__dirname, 'public')));
}

const lti = require('ltijs').Provider
lti.setup('LTIKEY',
  {
    url: 'mongodb://' + DB_URL + '/' + DB_NAME + '?authSource=admin',
    connection: { user: DB_USER, pass: DB_PASS }
  },
  {
    appRoute: path.join('/', ROOT_PATH), 
    loginRoute: path.join('/', ROOT_PATH, 'login'),
    keysetRoute: path.join('/', ROOT_PATH, 'keys'),
    serverAddon: middleware,
    cookies: {
      secure: true,
      sameSite: 'None'
    },
    dynRegRoute: path.join('/', ROOT_PATH, 'register'), 
    dynReg: {
      url: MY_DOMAIN + path.join('/', ROOT_PATH, '/'),
      name: 'SHINtube',
      logo: MY_DOMAIN + path.join('/', ROOT_PATH, '/images/favicon.ico'),
      description: 'Video sharing platform for Shinshu University.', 
      redirectUris: [
        MY_DOMAIN + MY_DOMAIN + path.join('/', ROOT_PATH),
        MY_DOMAIN + path.join('/', ROOT_PATH, '/deeplink'),
        MY_DOMAIN + path.join('/', ROOT_PATH, '/watch')
      ],
      autoActivate: true 
    }
  }
)

lti.app.set('views', path.join(__dirname, 'views'))
lti.app.set('view engine', 'ejs')
lti.app.use(fileUpload({
  useTempFiles : true,
  tempFileDir : path.join(__dirname,'/upload_tmp/')
}));

lti.onConnect((token, req, res) => {
  try{
    if(res.locals.context.roles.indexOf('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor') != -1){
      return lti.redirect(res, path.join('/', ROOT_PATH, '/videolist'), { newResource: true })
    }
    else{
      return lti.redirect(res, path.join('/', ROOT_PATH, '/about'), { newResource: true })
    }
  }catch(err){
    return lti.redirect(res, path.join('/', ROOT_PATH, '/about'), { newResource: true })
  }
  
})

lti.onDeepLinking(async (token, req, res) => {
  return lti.redirect(res, path.join('/', ROOT_PATH, '/deeplink'), { newResource: true })
})

lti.app.get('/deeplink', async (req, res) => {
  return res.render('deeplink')
})

lti.onInvalidToken(async (req, res, next) => { 
  return res.status(401).render('error', {"error":"001 : LTI認証エラー"})
})

lti.onSessionTimeout(async (req, res, next) => { 
  return res.status(401).render('error', {"error":"002 : タイムアウト"})
})

lti.onUnregisteredPlatform(async (req, res, next) => { 
  return res.status(401).render('error', {"error":"006 : 未登録のプラットフォーム"})
})

lti.onInactivePlatform(async (req, res, next) => { 
  return res.status(401).render('error', {"error":"007 : プラットフォームが有効化されていません"})
})

lti.onDynamicRegistration(async (req, res, next) => {
  try {
    if (!req.query.openid_configuration) return res.status(400).send({ status: 400, error: 'Bad Request', details: { message: 'Missing parameter: "openid_configuration".' } })

    if(req.query.regkey == REG_KEY){
      const message = await lti.DynamicRegistration.register(req.query.openid_configuration, req.query.registration_token)
      res.setHeader('Content-type', 'text/html')
      res.send(message)
    }
    else{
      res.status(400).send({ status: 400, error: 'Bad Request', details: { message: 'Dynamic registration key does not match.' } })
    }
  } catch (err) {
    if (err.message === 'PLATFORM_ALREADY_REGISTERED') return res.status(403).send({ status: 403, error: 'Forbidden', details: { message: 'Platform already registered.' } })
    return res.status(500).send({ status: 500, error: 'Internal Server Error', details: { message: err.message } })
  }
})


lti.whitelist(lti.appRoute(), { route: path.join('/', ROOT_PATH, '/error'), method: 'get' },{ route: path.join('/', ROOT_PATH, '/about'), method: 'get' },{ route: path.join('/', ROOT_PATH, '/TOS'), method: 'get' })

lti.app.use(ltiRoutes)
lti.app.use(videoRoutes)
lti.app.use(logapiRoutes)


const setup = async () => {
  await lti.deploy({ port: PORT })
  await platform.regPlatform()
}

setup()

