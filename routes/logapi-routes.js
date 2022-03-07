const router = require('express').Router()
const path = require('path')
const bodyParser = require('body-parser')
const learningLogger = require('../tool/log').learning

// Requiring Ltijs
const lti = require('ltijs').Provider

const CONFIG = require('../tool/config').getConfig()

router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json())


function log_escape(string){
    return String(string).replace(/&/g, '&lt;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, "&#x27;")
}

router.post(path.join('/', CONFIG.ROOT_PATH, '/log'), async (req, res) => {
    try{
        if(req.body.verb && req.body.obj){
            let _service = res.locals.token.iss.split("/")[3]
            try{
                if(isNaN(_service) || _service.length == 0){
                    _service = "1000"
                }
            }
            catch(err){
                _service = "1000"
            }
            const _cid = req.res.locals.context.lis.course_section_sourcedid
            const _sid = req.res.locals.token.userInfo.email.split("@")[0]

            if(req.body.obj_ex){
                let temp_obj = req.body.obj + "?"
                for(const ex in req.body.obj_ex){
                    let esc_ex = log_escape(ex)
                    temp_obj = temp_obj + esc_ex + "=" + log_escape(req.body.obj_ex[esc_ex]) + "&"
                }
                learningLogger.info(_service + '-' + _cid + '-' + _sid + ' ' + temp_obj.slice(0,-1) + ' ' + log_escape(req.body.verb))
            }
            else{
                learningLogger.info(_service + '-' + _cid + '-' + _sid + ' ' + log_escape(req.body.obj) + ' ' + log_escape(req.body.verb))
            }
            res.status(200).send({"status":200, "msg":"ok"})
        }
        else{
            res.status(400).send({"status":400, "msg":"verb or obj is not found"})
        }   
    }catch(err){        
        res.status(500).send({"status":500, "msg":err})
    }
})


module.exports = router