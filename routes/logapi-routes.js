const router = require('express').Router()
const path = require('path')
const bodyParser = require('body-parser')
const logger = require('../tool/log')

// Requiring Ltijs
const lti = require('ltijs').Provider

router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json());

const app_config = require('../config/app_config.json')
const ROOT_PATH = app_config.app_root_path || process.env.ROOT_PATH || "/"

function log_escape(string){
    return String(string).replace(/&/g, '&lt;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, "&#x27;")
}

router.post(path.join('/', ROOT_PATH, '/log'), async (req, res) => {
    try{
        if(req.body.verb && req.body.obj){
            var _cid = req.res.locals.context.lis.course_section_sourcedid
            var _sid = req.res.locals.token.userInfo.email.split("@")[0]
            if(req.body.obj_ex){
                var temp_obj = req.body.obj + "?"
                for(const ex in req.body.obj_ex){
                    var esc_ex = log_escape(ex)
                    temp_obj = temp_obj + esc_ex + "=" + log_escape(req.body.obj_ex[esc_ex]) + "&"
                }
                logger.log(_cid, _sid, temp_obj.slice(0,-1), log_escape(req.body.verb))
            }
            else{
                logger.log(_cid, _sid, log_escape(req.body.obj), log_escape(req.body.verb))
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