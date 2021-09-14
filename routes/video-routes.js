const router = require('express').Router()
const path = require('path')
const fs = require('fs')
const request = require('request');

// Requiring Ltijs
const lti = require('ltijs').Provider



function roleguard(req, res, next){
    if(res.locals.context.roles.indexOf('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor') != -1){
        next()
    }
    else{
        res.render('error', {"error":"003 : アクセス権限エラー"})
    }
}

router.get('/videolist',roleguard, async (req, res) => {
    res.render('videolist');
})

router.post('/videolist',roleguard, async (req, res) => {
    var year = res.locals.token.iss.slice(-4)
    var cid = res.locals.context.lis.course_section_sourcedid
    var options = {
        url: 'http://video-api.yukkuriikouze.com/linklist?year=' + year + '&cid=' + cid,
        method: 'GET'
    }
    
    request(options, function (error, response, body) {
        res.send(body)
    })
})

router.post('/videodelete',roleguard, async (req, res) => {
    var year = res.locals.token.iss.slice(-4)
    var cid = res.locals.context.lis.course_section_sourcedid
    var vid = req.body.vid
    var options = {
        url: 'http://video-api.yukkuriikouze.com/delete?year=' + year + '&cid=' + cid + '&vid=' + vid,
        method: 'POST'
    }
    
    request(options, function (error, response, body) {
        res.send(body)
    })
})

router.get('/watch', async (req, res) => {
    res.render('watch')
})

router.get('/upload',roleguard, async (req, res) => {
    res.render('upload')
})


router.post('/upload',roleguard, async (req, res) => {

    var year = res.locals.token.iss.slice(-4)
    var cid = res.locals.context.lis.course_section_sourcedid
    
    var options = {
        url: 'http://video-api.yukkuriikouze.com/upload?year=' + encodeURI(year) + '&cid=' + encodeURI(cid) + '&title=' + encodeURI(req.body.title) + '&explanation=' + encodeURI(req.body.explanation),
        method: 'POST',
        headers: {
            "Content-Type": "multipart/form-data"
        },
        formData: {
            "in_file" : fs.createReadStream(req.files.in_file.tempFilePath)
        }
    }
    
    request(options, function (error, response, body) {
        fs.unlink(req.files.in_file.tempFilePath, (err) => {
            if (err) throw err;
        });
        console.log(response.statusCode)
        if(response.statusCode == 200){
            lti.redirect(res, '/videolist', { newResource: true })
        }
        else{
            lti.redirect(res, '/upload-error', { newResource: true })
        }
    })
    
})

router.get('/edit',roleguard, async (req, res) => {
    res.render('edit')
})

router.post('/edit',roleguard, async (req, res) => {

    var year = res.locals.token.iss.slice(-4)
    var cid = res.locals.context.lis.course_section_sourcedid
    
    var options
    if(req.files){
        options = {
            url: 'http://video-api.yukkuriikouze.com/updatevideo?year=' + encodeURI(year) + '&cid=' + encodeURI(cid) + '&vid=' + encodeURI(req.body.vid) + '&title=' + encodeURI(req.body.title) + '&explanation=' + encodeURI(req.body.explanation),
            method: 'POST',
            headers: {
                "Content-Type": "multipart/form-data"
            },
            formData: {
                "in_file" : fs.createReadStream(req.files.in_file.tempFilePath)
            }
        }
    }
    else{
        options = {
            url: 'http://video-api.yukkuriikouze.com/updateinfo?year=' + encodeURI(year) + '&cid=' + encodeURI(cid) + '&vid=' + encodeURI(req.body.vid) + '&title=' + encodeURI(req.body.title) + '&explanation=' + encodeURI(req.body.explanation),
            method: 'POST',
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    }
    
    request(options, function (error, response, body) {
        if(req.files){
            fs.unlink(req.files.in_file.tempFilePath, (err) => {
                if (err) throw err;
            });
        }
        if(response.statusCode == 200){
            lti.redirect(res, '/videolist', { newResource: true })
        }
        else{
            lti.redirect(res, '/edit-error', { newResource: true })
        }
    })
    
})

router.get('/error', async (req, res) => {
    res.render('error', {"error":"LTI token error"})
})

router.get('/upload-error', async (req, res) => {
    res.render('error', {"error":"004 : アップロードに失敗しました"})
})

router.get('/edit-error', async (req, res) => {
    res.render('error', {"error":"005 : 更新に失敗しました"})
})

router.get('/view-progress', async (req, res) => {
    try {
        const idtoken = res.locals.token
        const response = await lti.Grade.getScores(idtoken, idtoken.platformContext.endpoint.lineitem, { userId: idtoken.user })
        return res.status(200).send(response)
    }
    catch (err) {
        console.log(err.message)
        return res.status(500).send({ err: err.message })
    }
})

router.post('/view-progress', async (req, res) => {
    try {
      const idtoken = res.locals.token
      const score = req.body.score
      const view_list = req.body.comment
  
      const gradeObj = {
        userId: idtoken.user,
        scoreGiven: score,
        scoreMaximum: 100,
        comment : view_list,
        activityProgress: 'Completed',
        gradingProgress: 'FullyGraded'
      }

      let lineItemId = idtoken.platformContext.endpoint.lineitem 
      if (!lineItemId) {
        const response = await lti.Grade.getLineItems(idtoken, { resourceLinkId: true })
        const lineItems = response.lineItems
        if (lineItems.length === 0) {
          const newLineItem = {
            scoreMaximum: 100,
            label: 'Grade',
            tag: 'grade',
            resourceLinkId: idtoken.platformContext.resource.id
          }
          const lineItem = await lti.Grade.createLineItem(idtoken, newLineItem)
          lineItemId = lineItem.id
        } else lineItemId = lineItems[0].id
      }
  
      const responseGrade = await lti.Grade.submitScore(idtoken, lineItemId, gradeObj)
      return res.send(responseGrade)
    } catch (err) {
      console.log(err.message)
      return res.status(500).send({ err: err.message })
    }
})

router.get("/return", async (req, res) => {
    var redirect_url = req.res.locals.token.iss + "/course/view.php?id=" + req.res.locals.context.context.id
    res.redirect(redirect_url)
});

router.get('/logout', async (req, res) => {
    var cookie_list = req.headers.cookie.split(";")
    var redirect_url = req.res.locals.token.iss + "/course/view.php?id=" + req.res.locals.context.context.id
    for(var cookie of cookie_list){
        var target_cookie = cookie.split("=")[0]
        if(target_cookie.indexOf( 'lti' ) !== -1){
            res.clearCookie(target_cookie);
        }
    }
    res.redirect(redirect_url)
})


const { createProxyMiddleware , responseInterceptor } = require('http-proxy-middleware')

const m3u8_proxy = createProxyMiddleware({ 
  target: 'http://video-api.yukkuriikouze.com', 
  changeOrigin: true ,
  selfHandleResponse: true, 
  pathRewrite: function (path, req) {
    var par = req.url.slice(1).split('/');
    var year = req.res.locals.token.iss.split("/")[3]
    var cid = req.res.locals.context.lis.course_section_sourcedid
    return "/" + par[0] + "/" + year + "/" + cid + "/" + par[1] + "/" + par[2]
  },
  onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
    const response = responseBuffer.toString('utf8')
    var ts_convert_url = ".ts?ltik=" + req.query.ltik
    var m3u5_convert_url = ".m3u8?ltik=" + req.query.ltik
    return response.replace(/.ts/g, ts_convert_url).replace(/.m3u8/g, m3u5_convert_url)
  })
});

const normal_proxy = createProxyMiddleware({ 
    target: 'http://video-api.yukkuriikouze.com', 
    changeOrigin: true ,
    pathRewrite: function (path, req) {
        var par = req.url.slice(1).split('/');
        var year = req.res.locals.token.iss.split("/")[3]
        var cid = req.res.locals.context.lis.course_section_sourcedid
        return "/" + par[0] + "/" + year + "/" + cid + "/" + par[1] + "/" + par[2]
    }
});

router.use('/video/*.m3u8', m3u8_proxy)
router.use('/video', normal_proxy)

module.exports = router