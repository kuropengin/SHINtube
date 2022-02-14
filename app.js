const express = require('express')
const path = require('path')
const fileUpload = require('express-fileupload');
const platform = require('./tool/platform')

const ltiRoutes = require('./routes/lti-routes')
const videoRoutes = require('./routes/video-routes')
const logapiRoutes = require('./routes/logapi-routes')

const CONFIG = require('./tool/config').getConfig()

const middleware = (app) => {
  app.use(path.join('/', CONFIG.ROOT_PATH), express.static(path.join(__dirname, 'public')));
}

const lti = require('ltijs').Provider
lti.setup('LTIKEY',
  {
    url: 'mongodb://' + CONFIG.DB_URL + '/' + CONFIG.DB_NAME + '?authSource=admin',
    connection: { user: CONFIG.DB_USER, pass: CONFIG.DB_PASS }
  },
  {
    appRoute: path.join('/', CONFIG.ROOT_PATH), 
    loginRoute: path.join('/', CONFIG.ROOT_PATH, 'login'),
    keysetRoute: path.join('/', CONFIG.ROOT_PATH, 'keys'),
    serverAddon: middleware,
    cookies: {
      secure: true,
      sameSite: 'None'
    },
    dynRegRoute: path.join('/', CONFIG.ROOT_PATH, 'register'), 
    dynReg: {
      url: CONFIG.MY_DOMAIN + path.join('/', CONFIG.ROOT_PATH, '/'),
      name: 'SHINtube',
      logo: CONFIG.MY_DOMAIN + path.join('/', CONFIG.ROOT_PATH, '/images/favicon.ico'),
      description: 'Video sharing platform for Shinshu University.', 
      redirectUris: [
        CONFIG.MY_DOMAIN + CONFIG.MY_DOMAIN + path.join('/', CONFIG.ROOT_PATH),
        CONFIG.MY_DOMAIN + path.join('/', CONFIG.ROOT_PATH, '/deeplink'),
        CONFIG.MY_DOMAIN + path.join('/', CONFIG.ROOT_PATH, '/watch')
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
    if(!res.locals.context.lis.course_section_sourcedid){
      return res.status(401).render('error', {"error":"011 : 授業コード取得エラー"})
    }
  }
  catch(err){
    return res.status(401).render('error', {"error":"001 : LTI認証エラー"})
  }
  try{
    if(res.locals.context.roles.indexOf('http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator') != -1 ||
      res.locals.context.roles.indexOf('http://purl.imsglobal.org/vocab/lis/v2/system/person#Administrator') != -1){
      return lti.redirect(res, path.join('/', CONFIG.ROOT_PATH, '/allvideolist'), { newResource: true })
    }
    else if(res.locals.context.roles.indexOf('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor') != -1){
      return lti.redirect(res, path.join('/', CONFIG.ROOT_PATH, '/videolist'), { newResource: true })
    }
    else{
      return lti.redirect(res, path.join('/', CONFIG.ROOT_PATH, '/about'), { newResource: true })
    }
  }catch(err){
    return lti.redirect(res, path.join('/', CONFIG.ROOT_PATH, '/about'), { newResource: true })
  }
  
})

lti.onDeepLinking(async (token, req, res) => {
  return lti.redirect(res, path.join('/', CONFIG.ROOT_PATH, '/deeplink'), { newResource: true })
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

    if(req.query.regkey == CONFIG.REG_KEY){
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


lti.whitelist(lti.appRoute(),
  {route: path.join('/', CONFIG.ROOT_PATH, '/ssowatch'), method: 'get'},
  {route: new RegExp(/^\/ssovideo/), method: 'get'},
  {route: path.join('/', CONFIG.ROOT_PATH, '/error'), method: 'get'},
  {route: path.join('/', CONFIG.ROOT_PATH, '/about'), method: 'get'},
  {route: path.join('/', CONFIG.ROOT_PATH, '/TOS'), method: 'get' },
  {route: path.join('/', CONFIG.ROOT_PATH, '/UploadAlert'), method: 'get' },
  {route: path.join('/', CONFIG.ROOT_PATH, '/CopyAlert'), method: 'get' },
  {route: path.join('/', CONFIG.ROOT_PATH, '/DeleteAlert'), method: 'get' }
)


lti.app.use(ltiRoutes)
lti.app.use(videoRoutes)
lti.app.use(logapiRoutes)


const setup = async () => {
  await lti.deploy({ port: CONFIG.PORT })
  await platform.regPlatform()
}

setup()

