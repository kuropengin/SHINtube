const router = require('express').Router()
const path = require('path')

// Requiring Ltijs
const lti = require('ltijs').Provider

const CONFIG = require('../tool/config').getConfig()

function roleguard(req, res, next){
  if(res.locals.context.roles.indexOf('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor') != -1){
      next()
  }
  else{
      res.render('error', {"error":"003 : アクセス権限エラー"})
  }
}

router.get(path.join('/', CONFIG.ROOT_PATH, '/deeplink'),roleguard, async (req, res) => {
  try {
    res.render('deeplink')
  } catch (err) {
    return res.status(500).send({"status":500, "msg":err})
  }
})

router.post(path.join('/', CONFIG.ROOT_PATH, '/deeplink'), async (req, res) => {
  try {
    const resource = req.body

    const items = {
      type: 'ltiResourceLink',
      title: resource.title,
      url: resource.url,
      custom: {
        name: resource.title,
        value: resource.url
      }
    }

    const form = await lti.DeepLinking.createDeepLinkingForm(res.locals.token, items, { message: 'Successfully Registered' })
    if (form) return res.send(form)
    return res.sendStatus(500)
  } catch (err) {
    return res.status(500).send({"status":500, "msg":err})
  }
})

router.get(path.join('/', CONFIG.ROOT_PATH, '/info'), async (req, res) => {
  const token = res.locals.token
  const context = res.locals.context

  const info = { }
  if (token.userInfo) {
    if (token.userInfo.name) info.name = token.userInfo.name
    if (token.user) info.uid = token.user
    if (token.userInfo.email) info.email = token.userInfo.email
  }

  if (context.roles) info.roles = context.roles
  if (context.context) info.context = context.context

  return res.send(info)
})


router.get(path.join('/', CONFIG.ROOT_PATH, '/test'), async (req, res) => {
  const token = res.locals.token
  const context = res.locals.context

  const info = {}
  if (token.userInfo) {
    if (token.userInfo.name) info.name = token.userInfo.name
    if (token.userInfo.email) info.email = token.userInfo.email
  }

  if (context.roles) info.roles = context.roles
  if (context.context) info.context = context.context
  
  return res.send(res.locals)
})


module.exports = router
