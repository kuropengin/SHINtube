const router = require('express').Router()
const path = require('path')
const fs = require('fs')
const request = require('request');
const system = require('../tool/system')

// Requiring Ltijs
const lti = require('ltijs').Provider

const backend_config = require('../config/backend_config.json')
const BACK_DOMAIN = backend_config.backend_url || process.env.BACK_DOMAIN

const app_config = require('../config/app_config.json')
const ROOT_PATH = app_config.app_root_path || process.env.ROOT_PATH || "/"

function roleguard(req, res, next){
    if(res.locals.context.roles.indexOf('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor') != -1){
        next()
    }
    else{
        res.render('error', {"error":"003 : アクセス権限エラー"})
    }
}

function getMeta(year,cid,vid){
    return new Promise(resolve => { 
        let options = {
            url: BACK_DOMAIN + '/video/' + encodeURI(year) + '/' + encodeURI(cid) + '/' + encodeURI(vid) + '/info.json' ,
            method: 'GET'
        }
        request(options, function (_error, _response, _body) {
            var temp_meta_data = {}
            if(_response.statusCode == 200){
                try{
                    temp_meta_data = JSON.parse(JSON.parse(_body).meta_data)
                }
                catch(e){
                    temp_meta_data = {
                        "contributor_name": "",
                        "contributor_id": ""
                    }
                }
            }
            resolve(temp_meta_data)
        })
    })
}

router.get(path.join('/', ROOT_PATH, '/about'), async (req, res) => {
    res.render('about')
})

router.get(path.join('/', ROOT_PATH, '/TOS'), async (req, res) => {
    res.sendFile(path.resolve('docs/TOS.md'));
})

router.get(path.join('/', ROOT_PATH, '/videolist'),roleguard, async (req, res) => {
    res.render('videolist');
})

router.post(path.join('/', ROOT_PATH, '/videolist'),roleguard, async (req, res) => {
    try{
        var year = res.locals.token.iss.split("/")[3]
        if(isNaN(year) || year.length == 0){
            year = "1000"
        }
    }
    catch(err){
        var year = "1000"
    }
    
    var cid = res.locals.context.lis.course_section_sourcedid
    var options = {
        url: BACK_DOMAIN + '/linklist?year=' + year + '&cid=' + cid,
        method: 'GET'
    }
    
    request(options, function (error, response, body) {
        res.send(body)
    })
})

router.post(path.join('/', ROOT_PATH, '/createplaylist'),roleguard, async (req, res) => {
    var metadata = {
        "contributor_name" : res.locals.token.userInfo.name,
        "contributor_id" : res.locals.token.user,
        "content_type":"playlist",
        "playlist": req.body.playlist
    }
    try{
        var year = res.locals.token.iss.split("/")[3]
        if(isNaN(year) || year.length == 0){
            year = "1000"
        }
    }
    catch(err){
        var year = "1000"
    }
    var cid = res.locals.context.lis.course_section_sourcedid
    
    var options = {
        url: BACK_DOMAIN + '/api/video/emptyfileupload?year=' + encodeURI(year) + '&cid=' + encodeURI(cid) + '&title=' + encodeURI(req.body.title) + '&explanation=' + encodeURI(req.body.explanation) + '&meta_data=' + encodeURI(JSON.stringify(metadata)),
        method: 'POST'
    }
    
    request(options, function (error, response, body) {
        if(response.statusCode == 200){
            res.send(body)
        }
        else{
            res.status(response.statusCode).send(body)
        }
    })
})

router.post(path.join('/', ROOT_PATH, '/updateplaylist'),roleguard, async (req, res) => {
    var cid = res.locals.context.lis.course_section_sourcedid
    try{
        var year = res.locals.token.iss.split("/")[3]
        if(isNaN(year) || year.length == 0){
            year = "1000"
        }
    }
    catch(err){
        var year = "1000"
    }

    var options = {
        url: BACK_DOMAIN + '/video/' + encodeURI(year) + '/' + encodeURI(cid) + '/' + encodeURI(req.body.vid) + '/info.json' ,
        method: 'GET'
    }
    request(options, function (error, response, body) {
        if(response.statusCode == 200){
            
            var temp_meta_data = JSON.parse(JSON.parse(body).meta_data)
            temp_meta_data["content_type"] = "playlist"
            temp_meta_data["playlist"] = req.body.playlist

            var _options = {
                url: BACK_DOMAIN + '/api/video/updateinfo?year=' + encodeURI(year) + '&cid=' + encodeURI(cid) + '&vid=' + encodeURI(req.body.vid) + '&title=' + encodeURI(req.body.title) + '&explanation=' + encodeURI(req.body.explanation) + '&meta_data=' + encodeURI(JSON.stringify(temp_meta_data)),
                method: 'POST'
            }

            request(_options, function (_error, _response, _body) {
                if(_response.statusCode == 200){
                    res.send({"vid":req.body.vid,"playlist":req.body.playlist})
                }
                else{
                    res.status(_response.statusCode).send(_body)
                }
            })   
        }
        else{
            res.status(response.statusCode).send(body)
        }
    })
})

router.post(path.join('/', ROOT_PATH, '/videodelete'),roleguard, async (req, res) => {
    try{
        var year = res.locals.token.iss.split("/")[3]
        if(isNaN(year) || year.length == 0){
            year = "1000"
        }
    }
    catch(err){
        var year = "1000"
    }
    var cid = res.locals.context.lis.course_section_sourcedid
    var vid = req.body.vid
    var options = {
        url: BACK_DOMAIN + '/delete?year=' + year + '&cid=' + cid + '&vid=' + vid,
        method: 'POST'
    }
    
    request(options, function (error, response, body) {
        res.send(body)
    })
})

router.get(path.join('/', ROOT_PATH, '/watch'), async (req, res) => {
    res.render('watch')
})

router.get(path.join('/', ROOT_PATH, '/system'),roleguard, async (req, res) => {
    res.render('system')
})

router.get(path.join('/', ROOT_PATH, '/system-check'),roleguard, async (req, res) => {
    const system_list = await system.check(req, res)
    res.send(system_list)
})

router.get(path.join('/', ROOT_PATH, '/upload'),roleguard, async (req, res) => {
    res.render('upload')
})


router.post(path.join('/', ROOT_PATH, '/upload'),roleguard, async (req, res) => {
    var metadata = {
        "contributor_name" : res.locals.token.userInfo.name,
        "contributor_id" : res.locals.token.user,
        "duration" : req.body.duration
    }
    try{
        var year = res.locals.token.iss.split("/")[3]
        if(isNaN(year) || year.length == 0){
            year = "1000"
        }
    }
    catch(err){
        var year = "1000"
    }
    var cid = res.locals.context.lis.course_section_sourcedid
    
    if(req.files){
        var options = {
            url: BACK_DOMAIN + '/upload?year=' + encodeURI(year) + '&cid=' + encodeURI(cid) + '&title=' + encodeURI(req.body.title) + '&explanation=' + encodeURI(req.body.explanation) + '&meta_data=' + encodeURI(JSON.stringify(metadata)),
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
            if(response.statusCode == 200){
                res.send(body)
            }
            else{
                res.status(response.statusCode).send(body)
            }
        })
    }
})

router.get(path.join('/', ROOT_PATH, '/edit'),roleguard, async (req, res) => {
    res.render('edit')
})


router.post(path.join('/', ROOT_PATH, '/edit'),roleguard, async (req, res) => {
    try{
        var year = res.locals.token.iss.split("/")[3]
        if(isNaN(year) || year.length == 0){
            year = "1000"
        }
    }
    catch(err){
        var year = "1000"
    }
    var cid = res.locals.context.lis.course_section_sourcedid
    var options

    if(req.files){
        var metadata = {
            "contributor_name" : res.locals.token.userInfo.name,
            "contributor_id" : res.locals.token.user,
            "duration" : req.body.duration
        }
        options = {
            url: BACK_DOMAIN + '/updatevideo?year=' + encodeURI(year) + '&cid=' + encodeURI(cid) + '&vid=' + encodeURI(req.body.vid) + '&title=' + encodeURI(req.body.title) + '&explanation=' + encodeURI(req.body.explanation) + '&meta_data=' + encodeURI(JSON.stringify(metadata)),
            method: 'POST',
            headers: {
                "Content-Type": "multipart/form-data"
            },
            formData: {
                "in_file" : fs.createReadStream(req.files.in_file.tempFilePath)
            }
        }
    }
    else if(req.body.duration){
        let req_meta_data = await getMeta(year,cid,req.body.vid)
        req_meta_data["duration"] = req.body.duration
        options = {
            url: BACK_DOMAIN + '/updateinfo?year=' + encodeURI(year) + '&cid=' + encodeURI(cid) + '&vid=' + encodeURI(req.body.vid) + '&title=' + encodeURI(req.body.title) + '&explanation=' + encodeURI(req.body.explanation) + '&meta_data=' + encodeURI(JSON.stringify(req_meta_data)),
            method: 'POST',
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    }
    else{
        options = {
            url: BACK_DOMAIN + '/updateinfo?year=' + encodeURI(year) + '&cid=' + encodeURI(cid) + '&vid=' + encodeURI(req.body.vid) + '&title=' + encodeURI(req.body.title) + '&explanation=' + encodeURI(req.body.explanation),
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
            res.send(body)
        }
        else{
            res.status(response.statusCode).send(body)
        }
    })
    
})



router.get(path.join('/', ROOT_PATH, '/error'), async (req, res) => {
    res.render('error', {"error":"LTI token error"})
})

router.get(path.join('/', ROOT_PATH, '/view-progress'), async (req, res) => {
    try {
        const view_vid = req.query.vid
        const idtoken = res.locals.token
        const response = await lti.Grade.getScores(idtoken, idtoken.platformContext.endpoint.lineitem, { userId: idtoken.user })
        if(response.scores.length){
            try{
                var send_comment = JSON.parse(response.scores[0].comment)
                if(view_vid in send_comment){
                    response.scores[0].resultScore = send_comment[view_vid].score
                    response.scores[0].comment = send_comment[view_vid].view_list
                }
                else{
                    response.scores[0].resultScore = 0
                    response.scores[0].comment = ""
                }
            }
            catch(e){}  

            return res.status(200).send(response)     
        }
        else{
            return res.status(200).send(response)
        }
    }
    catch (err) {
        console.error(err.message)
        return res.status(500).send({ err: err.message })
    }
})

router.post(path.join('/', ROOT_PATH, '/view-progress'), async (req, res) => {
    try {
        const idtoken = res.locals.token
        const nowLmsProgress = await lti.Grade.getScores(idtoken, idtoken.platformContext.endpoint.lineitem, { userId: idtoken.user })     

        const score = req.body.score
        const view_list = req.body.comment
        const view_duration = req.body.duration
        const view_vid = req.body.vid
        const view_playlist = req.body.playlist 

        var send_comment = {}
        var send_result_score = 0

        if(!nowLmsProgress.scores.length){
            if(view_playlist){
                send_result_score = view_playlist.length ? score / view_playlist.length : score
            }
            else{
                send_result_score = score
            }

            send_comment[view_vid] = {
                "score" : score,
                "view_list" : view_list
            }   
        }
        else{   
            try{
                send_comment = JSON.parse(nowLmsProgress.scores[0].comment)
                if(view_vid in send_comment){
                    send_comment[view_vid] = {
                        "score" : send_comment[view_vid].score || 0,
                        "view_list" : send_comment[view_vid].view_list || "0-0.1"
                    }
                }
            }
            catch(e){
                send_comment[view_vid] = {
                    "score" : nowLmsProgress.scores[0].resultScore || 0,
                    "view_list" : nowLmsProgress.scores[0].comment || "0-0.1"
                }
            }

            if(view_vid in send_comment){
                const rec_list = view_list.split(",").map(function(x){
                    var arrayX = x.split("-")
                    return [parseFloat(arrayX[0]),parseFloat(arrayX[1])]
                })
                const lms_list = send_comment[view_vid].view_list.split(",").map(function(x){
                    var arrayX = x.split("-")
                    return [parseFloat(arrayX[0]),parseFloat(arrayX[1])]
                })

                
                const allProgressList = lms_list.concat(rec_list)
                allProgressList.sort(function(a, b) {
                    if (a[0] === b[0]) {
                        return 0;
                    }
                    else {
                        return (a[0] < b[0]) ? -1 : 1;
                    }
                })

                var mergedProgressList = []
                mergedProgressList.push(allProgressList[0])
                
                for(const _temp of allProgressList){
                    if(_temp[0] > mergedProgressList[mergedProgressList.length - 1][1]){
                        mergedProgressList.push(_temp)
                    }
                    else if(_temp[1] > mergedProgressList[mergedProgressList.length - 1][1]){
                        mergedProgressList[mergedProgressList.length - 1][1] = _temp[1]
                    } 
                }     

                var view_sum = 0
                var send_view_list = []
                for(const progress_one of mergedProgressList){
                    view_sum += progress_one[1] - progress_one[0]
                    send_view_list.push(progress_one[0] + "-" + progress_one[1])
                }
                send_view_list = send_view_list.join(',')
                
                var send_score = Math.floor((view_sum / view_duration) * 100)

                send_comment[view_vid] = {
                    "score" : send_score,
                    "view_list" : send_view_list
                }   
            }
            else{
                send_comment[view_vid] = {
                    "score" : score,
                    "view_list" : view_list
                }   
            }

            if(view_playlist){
                var a_score = 0
                for(const t_score in send_comment){
                    if(send_comment[t_score].score && view_playlist.indexOf(t_score) != -1){
                        a_score += send_comment[t_score].score
                    } 
                }
                send_result_score = view_playlist.length ? a_score / view_playlist.length : a_score / Object.keys(send_comment).length

            }
            else{
                send_result_score = send_score
            }
             
        }

        const send_json = {
            userId: idtoken.user,
            scoreGiven: Math.floor(send_result_score) || 0,
            scoreMaximum: 100,
            comment : JSON.stringify(send_comment),
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
  
        const responseGrade = await lti.Grade.submitScore(idtoken, lineItemId, send_json)
        return res.send(responseGrade)
    } 
    catch (err) {
        console.error(err.message)
        return res.status(500).send({ err: err.message })
    }
})

router.get(path.join('/', ROOT_PATH, "/return"), async (req, res) => {
    var redirect_url = req.res.locals.token.iss + "/course/view.php?id=" + req.res.locals.context.context.id
    res.redirect(redirect_url)
});

router.get(path.join('/', ROOT_PATH, '/logout'), async (req, res) => {
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
    target: BACK_DOMAIN, 
    changeOrigin: true ,
    selfHandleResponse: true, 
    pathRewrite: function (path, req) {
      var temp_url = req.url.split('?')[0];
      var par = temp_url.slice(1).split('/');
      try{
          var year = req.res.locals.token.iss.split("/")[3]
          if(isNaN(year) || year.length == 0){
              year = "1000"
          }
      }
      catch(err){
          var year = "1000"
      }
      var cid = req.res.locals.context.lis.course_section_sourcedid
      return "/video/" + year + "/" + cid + "/" + par.slice(-2)[0] + "/" + par.slice(-1)[0]
    },
    onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
      const response = responseBuffer.toString('utf8')
      var ts_convert_url = ".ts?ltik=" + req.query.ltik
      var m3u5_convert_url = ".m3u8?ltik=" + req.query.ltik
      return response.replace(/.ts/g, ts_convert_url).replace(/.m3u8/g, m3u5_convert_url)
    })
  });
  
  const normal_proxy = createProxyMiddleware({ 
      target: BACK_DOMAIN, 
      changeOrigin: true ,
      pathRewrite: function (path, req) {
          var temp_url = req.url.split('?')[0];
          var par = temp_url.slice(1).split('/');
          try{
              var year = req.res.locals.token.iss.split("/")[3]
              if(isNaN(year) || year.length == 0){
                  year = "1000"
              }
          }
          catch(err){
              var year = "1000"
          }
          var cid = req.res.locals.context.lis.course_section_sourcedid
          return "/video/" + year + "/" + cid + "/" + par.slice(-2)[0] + "/" + par.slice(-1)[0]
      }
  });

router.use(path.join('/', ROOT_PATH, '/video/*.m3u8'), m3u8_proxy)
router.use(path.join('/', ROOT_PATH, '/video'), normal_proxy)

module.exports = router