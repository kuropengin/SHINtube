const request = require('request')
const lti = require('ltijs').Provider


async function appCheck(){
    try{
        const app_config = require('../package.json')
        return {"status":true, "name":app_config.name ,"version":app_config.version}
    }catch(e){
        return {"status":false,"msg":"Cannot read the set value."}
    }
}

async function backapiCheck(BACK_URL){
    var options = {
        url: BACK_URL,
        method: 'GET'
    }

    return new Promise((resolve, reject) => {
        request(options, function (error, response, body) {
            if(response.statusCode == 200){
                resolve({"status":true,"msg":"Successfully communicated with the backend."})
            }
            else{
                resolve({"status":false,"msg":"Failed to communicate with the backend."})
            }
        })
    })
}

async function backfileCheck(BACK_URL){
    var options = {
        url: BACK_URL + "/video/",
        method: 'GET'
    }

    return new Promise((resolve, reject) => {
        request(options, function (error, response, body) {
            if(response.statusCode == 200){
                resolve({"status":true,"msg":"Successfully communicated with the backend."})
            }
            else{
                resolve({"status":false,"msg":"Failed to communicate with the backend."})
            }
        })
    })
}

async function gradeCheck(req, res){
    try {
        const idtoken = res.locals.token
        const score = 0.1
    
        const gradeObj = {
            userId: idtoken.user,
            scoreGiven: score,
            scoreMaximum: 100,
            activityProgress: 'Completed',
            gradingProgress: 'FullyGraded'
        }

        let lineItemId = idtoken.platformContext.endpoint.lineitem 
        if (!lineItemId) {
            const response = await lti.Grade.getLineItems(idtoken, { resourceLinkId: true })
            const lineItems = response.lineItems
            if (lineItems.length === 0) {
                return {"status":false,"msg":"An error occurred while checking the grading system."}
            } 
            else lineItemId = lineItems[0].id
        }
    
        const responseGrade = await lti.Grade.submitScore(idtoken, lineItemId, gradeObj)
        //console.log(responseGrade)
        if(responseGrade.scoreGiven == 0.1){
            return {"status":true,"msg":"The grading system is available."}
        }
        else{
            return {"status":false,"msg":"An error occurred while checking the grading system."}
        }
    }
    catch (err) {
        return {"status":false,"msg":"An error occurred while checking the grading system."}
    }
}

async function deepLinkCheck(req, res){
    const context = res.locals.context
    var link_uri = ""

    if (context.targetLinkUri) link_uri = context.targetLinkUri

    if(link_uri.length){
        if(link_uri.indexOf("deeplink=true") != -1){
            const deeplink = new URL(link_uri)
            return {"status":true, "vid":deeplink.searchParams.get("video"), "msg":"Use a deep link."}
        }
        else{
            return {"status":false,"msg":"Not use a deep link."}
        }
    }
    else{
        return {"status":false,"msg":"Not use a deep link."}
    }
}

async function lmsCheck(req, res){
    const token = res.locals.token
    const context = res.locals.context
    const info = {}

    if (token.iss) info.lmsUri = token.iss
    if (token.iss){
        try{
            info.lmsYear = token.iss.split("/")[3]
            if(isNaN(info.lmsYear) || info.lmsYear.length == 0){
                info.lmsYear = "1000"
            }
        }
        catch(err){
            info.lmsYear = "1000"
        }
    } 

    if (token.platformId) info.platformId = token.platformId

    if (context.context) info.className = context.context
    if (context.lis) info.classCode = context.lis

    return info
}

async function systemCheck(req = false, res = false){
    var checkList = {}
    const backend_config = require('../config/backend_config.json')
    const BACK_TEMP = backend_config.backend_url || process.env.BACK_DOMAIN
    const BACK_URL = (BACK_TEMP[-1] == "/") ? BACK_TEMP.slice( 0,-1) : BACK_TEMP

    checkList.app_status = await appCheck()
    checkList.backapi_status = await backapiCheck(BACK_URL)
    checkList.backfile_status = await backfileCheck(BACK_URL)

    if(!req){
        console.log(checkList)
    }
    else{
        checkList.grade_status = await gradeCheck(req, res)
        checkList.deeplink_status = await deepLinkCheck(req, res)
        checkList.lms_status = await lmsCheck(req, res)
    }
    
    return checkList
}

exports.check = systemCheck