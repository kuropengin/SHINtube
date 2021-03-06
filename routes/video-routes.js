const router = require('express').Router()
const path = require('path')
const fs = require('fs')
const request = require('request');
const system = require('../tool/system')

const appLogger = require('../tool/log').app
const errorLogger = require('../tool/log').error

// Requiring Ltijs
const lti = require('ltijs').Provider

const CONFIG = require('../tool/config').getConfig()

function roleCheck(roles){
    if(roles.indexOf('http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator') != -1 ||
    roles.indexOf('http://purl.imsglobal.org/vocab/lis/v2/system/person#Administrator') != -1){
        return 2
    }
    else if(roles.indexOf('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor') != -1){
        return 1
    }
    else{
        return 0
    }
}

async function roleguard(req, res, next){
    const role = await roleCheck(res.locals.context.roles)
    if(role){
        next()
    }
    else{
        res.render('error', {"error":"003 : アクセス権限エラー"})
    }
}

async function adminguard(req, res, next){
    const role = await roleCheck(res.locals.context.roles)
    if(role == 2){
        next()
    }
    else{
        res.render('error', {"error":"003 : アクセス権限エラー"})
    }
}

function getMeta(service,cid,vid){
    return new Promise(resolve => { 
        let options = {
            url: CONFIG.BACK_DOMAIN + '/video/' + encodeURIComponent(service) + '/' + encodeURIComponent(cid) + '/' + encodeURIComponent(vid) + '/info.json' ,
            method: 'GET'
        }
        request(options, function (_error, _response, _body) {
            var temp_meta_data = {}
            if(_response !== undefined && _response.statusCode == 200){
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

router.get(path.join('/', CONFIG.ROOT_PATH, '/about'), async (req, res) => {
    res.render('about')
})

router.get(path.join('/', CONFIG.ROOT_PATH, '/TOS'), async (req, res) => {
    res.sendFile(path.resolve('docs/TOS.md'))
})

router.get(path.join('/', CONFIG.ROOT_PATH, '/UploadAlert'), async (req, res) => {
    res.sendFile(path.resolve('docs/UploadAlert.md'))
})

router.get(path.join('/', CONFIG.ROOT_PATH, '/CopyAlert'), async (req, res) => {
    res.sendFile(path.resolve('docs/CopyAlert.md'))
})

router.get(path.join('/', CONFIG.ROOT_PATH, '/DeleteAlert'), async (req, res) => {
    res.sendFile(path.resolve('docs/DeleteAlert.md'))
})

router.post(path.join('/', CONFIG.ROOT_PATH, '/copy'),adminguard, async (req, res) => {
    const options = {
        url: CONFIG.BACK_DOMAIN + '/api/video/copydirectory?src_service_name=' + encodeURIComponent(req.query["src_service"]) + 
        '&src_cid=' + encodeURIComponent(req.query["src_cid"]) + 
        (("src_vid" in req.query)? '&src_vid=' + encodeURIComponent(req.query["src_vid"]) : "") + 
        '&dst_service_name=' + encodeURIComponent(req.query["dst_service"]) + 
        '&dst_cid=' + encodeURIComponent(req.query["dst_cid"]),
        method: 'POST'
    }
    request(options, function (error, response, body) {
        if(response !== undefined && response.statusCode == 200){
            res.send(body)
        }
        else{
            try{
                res.status(response.statusCode).send(body)
            }
            catch(e){
                res.status(500).send("Failed to communicate with the backend.")
            }
        }
    })
})

router.post(path.join('/', CONFIG.ROOT_PATH, '/newserviceclass'),roleguard, async (req, res) => {
    const role = await roleCheck(req.res.locals.context.roles)
    let create_service = req.query["service"] || ""
    let create_class = req.query["class"] || ""

    if((!create_service && !create_class) || role !=2 ){
        create_service = req.res.locals.token.iss.split("/")[3]
        create_class = req.res.locals.context.lis.course_section_sourcedid
    }

    const options = {
        url: CONFIG.BACK_DOMAIN + '/api/video/directory?service_name=' + encodeURIComponent(create_service) + ((create_class.length)? '&cid=' + encodeURIComponent(create_class) : ""),
        method: 'POST'
    }
    request(options, function (error, response, body) {
        if(response !== undefined && response.statusCode == 200){
            res.send(body)
        }
        else{
            try{
                res.status(response.statusCode).send(body)
            }
            catch(e){
                res.status(500).send("Failed to communicate with the backend.")
            }
        }
    })
})

router.post(path.join('/', CONFIG.ROOT_PATH, '/deleteserviceclass'),adminguard, async (req, res) => {
    const options = {
        url: CONFIG.BACK_DOMAIN + '/api/video/directory?service_name=' + encodeURIComponent(req.query["service"]) + (("class" in req.query)? '&cid=' + encodeURIComponent(req.query["class"]) : ""),
        method: 'DELETE'
    }
    request(options, function (error, response, body) {
        if(response !== undefined && response.statusCode == 200){
            res.send(body)
        }
        else{
            try{
                res.status(response.statusCode).send(body)
            }
            catch(e){
                res.status(500).send("Failed to communicate with the backend.")
            }
        }
    })
})

router.get(path.join('/', CONFIG.ROOT_PATH, '/ssourl'),adminguard, async (req, res) => {
    res.send({"link":CONFIG.SSO_LINK,"url":CONFIG.SSO_URL})
})

router.get(path.join('/', CONFIG.ROOT_PATH, '/allvideolist'),adminguard, async (req, res) => {
    if(req.query["service"] && req.query["class"]){
        res.render('listbase',{'view_type':'videolist','role':'admin'})
    }
    else{
        res.render('listbase',{'view_type':'service_class','role':'admin'})
    }
})

router.get(path.join('/', CONFIG.ROOT_PATH, '/servicelist'),adminguard, async (req, res) => {
    const options = {
        url: CONFIG.BACK_DOMAIN + '/api/video/servicelist',
        method: 'GET'
    }
    request(options, function (error, response, body) {
        if(response !== undefined && response.statusCode == 200){
            res.send(body)
        }
        else{
            try{
                res.status(response.statusCode).send(body)
            }
            catch(e){
                res.status(500).send("Failed to communicate with the backend.")
            }
        }
    })
})

router.get(path.join('/', CONFIG.ROOT_PATH, '/classlist'),adminguard, async (req, res) => {
    const options = {
        url: CONFIG.BACK_DOMAIN + '/api/video/classlist?service_name=' + encodeURIComponent(req.query["service"]),
        method: 'GET'
    }
    request(options, function (error, response, body) {
        if(response !== undefined && response.statusCode == 200){
            res.send(body)
        }
        else{
            try{
                res.status(response.statusCode).send(body)
            }
            catch(e){
                res.status(500).send("Failed to communicate with the backend.")
            }
        }
    })
})

router.get(path.join('/', CONFIG.ROOT_PATH, '/videolist'),roleguard, async (req, res) => {
    const role = await roleCheck(res.locals.context.roles)
    if(role == 2){
        res.render('listbase',{'view_type':'videolist','role':'admin'})
    }
    else{
        res.render('listbase',{'view_type':'videolist','role':'noadmin'})
    }
    
})

router.get(path.join('/', CONFIG.ROOT_PATH, '/getvideolist'),roleguard, async (req, res) => {
    let service = res.locals.token.iss.split("/")[3]
    let cid = res.locals.context.lis.course_section_sourcedid
    const role = await roleCheck(req.res.locals.context.roles)
    
    try{
        if(isNaN(service) || service.length == 0){
            service = "1000"
        }
    }
    catch(err){
        service = "1000"
    }

    if("service" in req.query && "class" in req.query && role == 2){
        service = req.query["service"]
        cid = req.query["class"] 
    } 

    const options = {
        url: CONFIG.BACK_DOMAIN + '/api/video/linklist?service_name=' + service + '&cid=' + cid,
        method: 'GET'
    }
    
    request(options, function (error, response, body) {
        res.send(body)
    })
})

router.post(path.join('/', CONFIG.ROOT_PATH, '/createplaylist'),roleguard, async (req, res) => {
    let service = res.locals.token.iss.split("/")[3]
    let cid = res.locals.context.lis.course_section_sourcedid
    const role = await roleCheck(req.res.locals.context.roles)

    const metadata = {
        "contributor_name" : res.locals.token.userInfo.name,
        "contributor_id" : res.locals.token.user,
        "content_type":"playlist",
        "playlist": req.body.playlist
    }
    try{
        if(isNaN(service) || service.length == 0){
            service = "1000"
        }
    }
    catch(err){
        service = "1000"
    }

    if("service" in req.query && "class" in req.query && role == 2){
        service = req.query["service"]
        cid = req.query["class"] 
    } 
    
    const options = {
        url: CONFIG.BACK_DOMAIN + '/api/video/emptyfileupload?service_name=' + encodeURIComponent(service) + '&cid=' + encodeURIComponent(cid) + '&title=' + encodeURIComponent(req.body.title) + '&explanation=' + encodeURIComponent(req.body.explanation) + '&meta_data=' + encodeURIComponent(JSON.stringify(metadata)),
        method: 'POST'
    }
    
    request(options, function (error, response, body) {
        if(response !== undefined && response.statusCode == 200){
            appLogger.info('[SHINtube] ' + service + '-' + cid + ' playlist created')
            res.send(body)
        }
        else{
            try{
                errorLogger.error('[create playlist error]' + body)
                res.status(response.statusCode).send(body)
            }
            catch(e){
                errorLogger.error('[create playlist error]Failed to communicate with the backend')
                res.status(500).send("Failed to communicate with the backend.")
            }
        }
    })
})

router.post(path.join('/', CONFIG.ROOT_PATH, '/updateplaylist'),roleguard, async (req, res) => {
    let service = res.locals.token.iss.split("/")[3]
    let cid = res.locals.context.lis.course_section_sourcedid
    const role = await roleCheck(req.res.locals.context.roles)

    try{
        if(isNaN(service) || service.length == 0){
            service = "1000"
        }
    }
    catch(err){
        service = "1000"
    }

    if("service" in req.query && "class" in req.query && role == 2){
        service = req.query["service"]
        cid = req.query["class"] 
    } 

    const options = {
        url: CONFIG.BACK_DOMAIN + '/video/' + encodeURIComponent(service) + '/' + encodeURIComponent(cid) + '/' + encodeURIComponent(req.body.vid) + '/info.json' ,
        method: 'GET'
    }
    request(options, function (error, response, body) {
        if(response !== undefined && response.statusCode == 200){
            
            let temp_meta_data = JSON.parse(JSON.parse(body).meta_data)
            temp_meta_data["content_type"] = "playlist"
            temp_meta_data["playlist"] = req.body.playlist

            const _options = {
                url: CONFIG.BACK_DOMAIN + '/api/video/updateinfo?service_name=' + encodeURIComponent(service) + '&cid=' + encodeURIComponent(cid) + '&vid=' + encodeURIComponent(req.body.vid) + '&title=' + encodeURIComponent(req.body.title) + '&explanation=' + encodeURIComponent(req.body.explanation) + '&meta_data=' + encodeURIComponent(JSON.stringify(temp_meta_data)),
                method: 'POST'
            }

            request(_options, function (_error, _response, _body) {
                if(_response.statusCode == 200){
                    appLogger.info('[SHINtube] ' + service + '-' + cid + ' ' + req.body.vid + ' updated')
                    res.send({"vid":req.body.vid,"playlist":req.body.playlist})
                }
                else{
                    errorLogger.error('[update playlist error]' + _body)
                    res.status(_response.statusCode).send(_body)
                }
            })   
        }
        else{
            try{
                errorLogger.error('[update playlist error]' + body)
                res.status(response.statusCode).send(body)
            }
            catch(e){
                errorLogger.error('[update playlist error]Failed to communicate with the backend')
                res.status(500).send("Failed to communicate with the backend.")
            }
        }
    })
})

router.post(path.join('/', CONFIG.ROOT_PATH, '/videodelete'),roleguard, async (req, res) => {
    let service = res.locals.token.iss.split("/")[3]
    let cid = res.locals.context.lis.course_section_sourcedid
    const vid = req.body.vid
    const role = await roleCheck(req.res.locals.context.roles)

    try{
        if(isNaN(service) || service.length == 0){
            service = "1000"
        }
    }
    catch(err){
        service = "1000"
    }

    if("service" in req.query && "class" in req.query && role == 2){
        service = req.query["service"]
        cid = req.query["class"] 
    } 
    
    const options = {
        url: CONFIG.BACK_DOMAIN + '/api/video/delete?service_name=' + encodeURIComponent(service) + '&cid=' + encodeURIComponent(cid) + '&vid=' + encodeURIComponent(vid),
        method: 'DELETE'
    }
    
    request(options, function (error, response, body) {
        if(response !== undefined && response.statusCode == 200){
            appLogger.info('[SHINtube] ' + service + '-' + cid + ' ' + vid + ' deleted')
            res.send(body)
        }
        else{
            try{
                errorLogger.error('[delete video error]' + body)
                res.status(response.statusCode).send(body)
            }
            catch(e){
                errorLogger.error('[delete video error]Failed to communicate with the backend')
                res.status(500).send("Failed to communicate with the backend.")
            }
        }
    })
})

router.get(path.join('/', CONFIG.ROOT_PATH, '/watch'), async (req, res) => {
    res.render('watch')
})

router.get(path.join('/', CONFIG.ROOT_PATH, '/ssowatch'), async (req, res) => {
    if(CONFIG.SSO_LINK){
        const config_sso_url = new URL(CONFIG.SSO_URL)
        const permission_host = config_sso_url.host
        if(req.headers["host"] != permission_host){
            res.status(403).render('error', {"error":"009 : 認可ドメイン以外からのアクセス"})
        }
        else{
            res.render('watch')
        }
    }
    else{
        res.status(401).render('error', {"error":"008 : 機能が有効化されていません"})
    }   
})

router.get(path.join('/', CONFIG.ROOT_PATH, '/system'),roleguard, async (req, res) => {
    const role = await roleCheck(res.locals.context.roles)
    if(role == 2){
        res.render('system',{'view_type':'system','role':'admin'})
    }
    else{
        res.render('system',{'view_type':'system','role':'noadmin'})
    }
})

router.get(path.join('/', CONFIG.ROOT_PATH, '/system-check'),roleguard, async (req, res) => {
    const system_list = await system.check(req, res)
    res.send(system_list)
})

router.get(path.join('/', CONFIG.ROOT_PATH, '/upload'),roleguard, async (req, res) => {
    const role = await roleCheck(res.locals.context.roles)
    if(role == 2){
        res.render('upload',{'view_type':'upload','role':'admin'})
    }
    else{
        res.render('upload',{'view_type':'upload','role':'noadmin'})
    }
})


router.post(path.join('/', CONFIG.ROOT_PATH, '/upload'),roleguard, async (req, res) => {
    let service = res.locals.token.iss.split("/")[3]
    let cid = res.locals.context.lis.course_section_sourcedid
    const role = await roleCheck(req.res.locals.context.roles)

    try{
        if(isNaN(service) || service.length == 0){
            service = "1000"
        }
    }
    catch(err){
        service = "1000"
    }

    if("service" in req.body && "class" in req.body && role == 2){
        service = req.body["service"]
        cid = req.body["class"]
    }

    const metadata = {
        "contributor_name" : res.locals.token.userInfo.name,
        "contributor_id" : res.locals.token.user,
        "duration" : req.body.duration
    }

    if(req.files){
        const options = {
            url: CONFIG.BACK_DOMAIN + '/api/video/upload?service_name=' + encodeURIComponent(service) + '&cid=' + encodeURIComponent(cid) + '&title=' + encodeURIComponent(req.body.title) + '&explanation=' + encodeURIComponent(req.body.explanation) + '&meta_data=' + encodeURIComponent(JSON.stringify(metadata)),
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
            })
            if(response !== undefined && response.statusCode == 200){
                appLogger.info('[SHINtube] ' + service + '-' + cid + ' video added')
                res.send(body)
            }
            else{
                try{
                    errorLogger.error('[add video error]' + body)
                    res.status(response.statusCode).send(body)
                }
                catch(e){
                    errorLogger.error('[add video error]Failed to communicate with the backend')
                    res.status(500).send("Failed to communicate with the backend.")
                }
            }
        })
    }
    else{
        res.status(400).send({"status":400, "msg":"video file is not found"})
    }
})

router.get(path.join('/', CONFIG.ROOT_PATH, '/edit'),roleguard, async (req, res) => {
    const role = await roleCheck(res.locals.context.roles)
    if(role == 2){
        res.render('edit',{'view_type':'edit','role':'admin'})
    }
    else{
        res.render('edit',{'view_type':'edit','role':'noadmin'})
    }
})


router.post(path.join('/', CONFIG.ROOT_PATH, '/edit'),roleguard, async (req, res) => {
    let service = res.locals.token.iss.split("/")[3]
    let cid = res.locals.context.lis.course_section_sourcedid
    const role = await roleCheck(req.res.locals.context.roles)

    try{
        if(isNaN(service) || service.length == 0){
            service = "1000"
        }
    }
    catch(err){
        service = "1000"
    }

    if("service" in req.body && "class" in req.body && role == 2){
        service = req.body["service"]
        cid = req.body["class"]
    }


    let options

    if(req.files){
        const metadata = {
            "contributor_name" : res.locals.token.userInfo.name,
            "contributor_id" : res.locals.token.user,
            "duration" : req.body.duration
        }
        options = {
            url: CONFIG.BACK_DOMAIN + '/api/video/updatevideo?service_name=' + encodeURIComponent(service) + '&cid=' + encodeURIComponent(cid) + '&vid=' + encodeURIComponent(req.body.vid) + '&title=' + encodeURIComponent(req.body.title) + '&explanation=' + encodeURIComponent(req.body.explanation) + '&meta_data=' + encodeURIComponent(JSON.stringify(metadata)),
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
        let req_meta_data = await getMeta(service,cid,req.body.vid)
        req_meta_data["duration"] = req.body.duration
        options = {
            url: CONFIG.BACK_DOMAIN + '/api/video/updateinfo?service_name=' + encodeURIComponent(service) + '&cid=' + encodeURIComponent(cid) + '&vid=' + encodeURIComponent(req.body.vid) + '&title=' + encodeURIComponent(req.body.title) + '&explanation=' + encodeURIComponent(req.body.explanation) + '&meta_data=' + encodeURIComponent(JSON.stringify(req_meta_data)),
            method: 'POST',
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    }
    else{
        options = {
            url: CONFIG.BACK_DOMAIN + '/api/video/updateinfo?service_name=' + encodeURIComponent(service) + '&cid=' + encodeURIComponent(cid) + '&vid=' + encodeURIComponent(req.body.vid) + '&title=' + encodeURIComponent(req.body.title) + '&explanation=' + encodeURIComponent(req.body.explanation),
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
            })
        }
        if(response !== undefined && response.statusCode == 200){
            appLogger.info('[SHINtube] ' + service + '-' + cid + ' ' + req.body.vid + ' edited')
            res.send(body)
        }
        else{
            try{
                errorLogger.error('[edit video error]' + body)
                res.status(response.statusCode).send(body)
            }
            catch(e){
                errorLogger.error('[edit video error]Failed to communicate with the backend')
                res.status(500).send("Failed to communicate with the backend.")
            }
        }
    })
    
})



router.get(path.join('/', CONFIG.ROOT_PATH, '/error'), async (req, res) => {
    res.render('error', {"error":"LTI token error"})
})

router.get(path.join('/', CONFIG.ROOT_PATH, '/view-progress'), async (req, res) => {
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
        errorLogger.error(err.message)
        return res.status(500).send({ err: err.message })
    }
})

router.post(path.join('/', CONFIG.ROOT_PATH, '/view-progress'), async (req, res) => {
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
        errorLogger.error(err.message)
        return res.status(500).send({ err: err.message })
    }
})

router.get(path.join('/', CONFIG.ROOT_PATH, "/return"), async (req, res) => {
    var redirect_url = req.res.locals.token.iss + "/course/view.php?id=" + req.res.locals.context.context.id
    res.redirect(redirect_url)
});

router.get(path.join('/', CONFIG.ROOT_PATH, '/logout'), async (req, res) => {
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

const sso_m3u8_proxy = createProxyMiddleware({ 
    target: CONFIG.BACK_DOMAIN, 
    changeOrigin: true ,
    selfHandleResponse: true, 
    pathRewrite: async function (path, req) {
        const service = req.query["service"]
        const cid = req.query["class"] 

        const temp_url = req.url.split('?')[0]
        const par = temp_url.slice(1).split('/')
        const vid = par.slice(-2)[0]

        return "/video/" + service + "/" + cid + "/" + vid + "/" + par.slice(-1)[0]
    },
    onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        const response = responseBuffer.toString('utf8')
        const ts_convert_url = ".ts?service=" + req.query["service"] + "&class=" + req.query["class"]
        const m3u8_convert_url = ".m3u8?service=" + req.query["service"] + "&class=" + req.query["class"]

        return response.replace(/.ts/g, ts_convert_url).replace(/.m3u8/g, m3u8_convert_url)
    }),
    onError:function(err, req, res, target){
      errorLogger.error("[proxy try error] " + err)
    },
    logProvider: function (provider) {
      provider.log = function (message) {
        appLogger.log(message)
      }
      provider.debug = function (message) {
        appLogger.debug(message)
      }
      provider.info = function (message) {
        appLogger.info(message)
      }
      provider.warn = function (message) {
        errorLogger.warn(message)
      }
      provider.error = function (message) {
        errorLogger.error(message)
      }
      return provider
    }
});

const sso_normal_proxy = createProxyMiddleware({ 
    target: CONFIG.BACK_DOMAIN, 
    changeOrigin: true ,
    pathRewrite: async function (path, req) {

        const service = req.query["service"]
        const cid = req.query["class"] 

        const temp_url = req.url.split('?')[0]
        const par = temp_url.slice(1).split('/')
        const vid = par.slice(-2)[0]

        return "/video/" + service + "/" + cid + "/" + vid + "/" + par.slice(-1)[0]
    },
    onError:function(err, req, res, target){
      errorLogger.error("[proxy try error] " + err)
    },
    logProvider: function (provider) {
      provider.log = function (message) {
        appLogger.log(message)
      }
      provider.debug = function (message) {
        appLogger.debug(message)
      }
      provider.info = function (message) {
        appLogger.info(message)
      }
      provider.warn = function (message) {
        errorLogger.warn(message)
      }
      provider.error = function (message) {
        errorLogger.error(message)
      }
      return provider
    }
});

const m3u8_proxy = createProxyMiddleware({ 
    target: CONFIG.BACK_DOMAIN, 
    changeOrigin: true ,
    selfHandleResponse: true, 
    pathRewrite: async function (path, req) {
        const temp_url = req.url.split('?')[0]
        const par = temp_url.slice(1).split('/')
        const role = await roleCheck(req.res.locals.context.roles)
        
        let service = req.res.locals.token.iss.split("/")[3]
        let cid = req.res.locals.context.lis.course_section_sourcedid
        try{
            if(isNaN(service) || service.length == 0){
                service = "1000"
            }
        }
        catch(err){
            service = "1000"
        }
        if("service" in req.query && "class" in req.query && role == 2){
            service = req.query["service"]
            cid = req.query["class"] 
        } 
        
        return "/video/" + service + "/" + cid + "/" + par.slice(-2)[0] + "/" + par.slice(-1)[0]
    },
    onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        const response = responseBuffer.toString('utf8')
        const role = await roleCheck(req.res.locals.context.roles)
        let ts_convert_url = ".ts?ltik=" + req.query.ltik
        let m3u8_convert_url = ".m3u8?ltik=" + req.query.ltik

        if("service" in req.query && "class" in req.query && role == 2){
            ts_convert_url += "&service=" + req.query["service"] + "&class=" + req.query["class"]
            m3u8_convert_url += "&service=" + req.query["service"] + "&class=" + req.query["class"]
        }

        return response.replace(/.ts/g, ts_convert_url).replace(/.m3u8/g, m3u8_convert_url)
    }),
    onError:function(err, req, res, target){
      errorLogger.error("[proxy try error] " + err)
    },
    logProvider: function (provider) {
      provider.log = function (message) {
        appLogger.log(message)
      }
      provider.debug = function (message) {
        appLogger.debug(message)
      }
      provider.info = function (message) {
        appLogger.info(message)
      }
      provider.warn = function (message) {
        errorLogger.warn(message)
      }
      provider.error = function (message) {
        errorLogger.error(message)
      }
      return provider
    }

});
  
const normal_proxy = createProxyMiddleware({ 
    target: CONFIG.BACK_DOMAIN, 
    changeOrigin: true ,
    pathRewrite: async function (path, req) {
        const temp_url = req.url.split('?')[0]
        const par = temp_url.slice(1).split('/')
        const role = await roleCheck(req.res.locals.context.roles)

        let service = req.res.locals.token.iss.split("/")[3]
        let cid = req.res.locals.context.lis.course_section_sourcedid
        try{
            if(isNaN(service) || service.length == 0){
                service = "1000"
            }
        }
        catch(err){
            service = "1000"
        }

        if("service" in req.query && "class" in req.query && role == 2){
            service = req.query["service"]
            cid = req.query["class"] 
        } 

        return "/video/" + service + "/" + cid + "/" + par.slice(-2)[0] + "/" + par.slice(-1)[0]
    },
    onError:function(err, req, res, target){
      errorLogger.error("[proxy try error] " + err)
    },
    logProvider: function (provider) {
      provider.log = function (message) {
        appLogger.log(message)
      }
      provider.debug = function (message) {
        appLogger.debug(message)
      }
      provider.info = function (message) {
        appLogger.info(message)
      }
      provider.warn = function (message) {
        errorLogger.warn(message)
      }
      provider.error = function (message) {
        errorLogger.error(message)
      }
      return provider
    }
});

function ssoCheck(req,res,next){
    
    if(CONFIG.SSO_LINK){
        const config_sso_url = new URL(CONFIG.SSO_URL)
        const permission_host = config_sso_url.host 
        if(req.headers["host"] != permission_host){
            res.status(403).send({"status":403, "msg":"Access from non-authorized domains"})
        }

        if("service" in req.query && "class" in req.query){
            next()
        }
        else{
            res.status(400).send({"status":400, "msg":"service or class, vid not found"})
        }
    }
    else{
        res.status(423).send({"status":423, "msg":"The sso link is not activated"})
    }
}

router.use(path.join('/', CONFIG.ROOT_PATH, '/ssovideo/*.m3u8'), ssoCheck, sso_m3u8_proxy)
router.use(path.join('/', CONFIG.ROOT_PATH, '/ssovideo'), ssoCheck, sso_normal_proxy)

router.use(path.join('/', CONFIG.ROOT_PATH, '/video/*.m3u8'), m3u8_proxy)
router.use(path.join('/', CONFIG.ROOT_PATH, '/video'), normal_proxy)


module.exports = router