const express = require('express')
const path = require('path')
const fileUpload = require('express-fileupload');
const ltiRoutes = require('./routes/lti-routes')
const videoRoutes = require('./routes/video-routes')

const db_config = require('../config/db_config.json')
const lti_config = require('../config/lti_config.json')

const DB_URL = db_config.mongo_url || process.env.DB_URL || "mongo"
const DB_NAME = db_config.db_name || process.env.DB_NAME || "eALPluS-video"
const DB_USER = db_config.user || process.env.DB_USER || "root"
const DB_PASS = db_config.pass || process.env.DB_PASS || "pass"

const MY_DOMAIN = lti_config.my_domain || process.env.MY_DOMAIN || ""
const PORT = lti_config.port || process.env.PORT || 3000


const lti = require('ltijs').Provider
lti.setup('LTIKEY',
  {
    url: 'mongodb://' + DB_URL + '/' + DB_NAME + '?authSource=admin',
    connection: { user: DB_USER, pass: DB_PASS }
  },
  {
    appRoute: '/', 
    loginRoute: '/login',
    staticPath: path.join(__dirname, 'public'),
    cookies: {
      secure: true,
      sameSite: 'None'
    },
    dynRegRoute: '/register', 
    dynReg: {
      url: 'MY_DOMAIN',
      name: 'SHINtube',
      logo: MY_DOMAIN + '/images/favicon.ico',
      description: 'Video sharing platform for Shinshu University.', 
      redirectUris: [
        MY_DOMAIN,
        MY_DOMAIN + '/deeplink',
        MY_DOMAIN + '/watch'
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
  //return res.render('index', { title: 'Express' })
  return lti.redirect(res, '/videolist', { newResource: true })
})

lti.onDeepLinking(async (token, req, res) => {
  return lti.redirect(res, '/deeplink', { newResource: true })
})

lti.app.get('/deeplink', async (req, res) => {
  return res.render('deeplink')
})

lti.onInvalidToken(async (req, res, next) => { 
  return res.status(401).render('error', {"error":"001 : LTI認証エラー"})
})


lti.whitelist(lti.appRoute(), { route: '/error', method: 'get' })

lti.app.use(ltiRoutes)
lti.app.use(videoRoutes)


const setup = async () => {
  await lti.deploy({ port: PORT })
}

setup()

