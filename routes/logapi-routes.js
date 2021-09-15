const router = require('express').Router()
const path = require('path')
const bodyParser = require('body-parser');
const logger = require('../tool/log');

// Requiring Ltijs
const lti = require('ltijs').Provider

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post('/log', async (req, res) => {
    try{
        if(req.body.verb && req.body.obj){
            var _cid = req.res.locals.context.lis.course_section_sourcedid
            var _sid = req.res.locals.token.userInfo.email.split("@")[0]
    
            logger.log(_cid, _sid, req.body.obj, req.body.verb)
            res.status(200)
        }
        else{
            res.status(201)
        }   
    }catch(err){
        res.status(201)
    }
})


module.exports = router