const lti = require('ltijs').Provider
const lti_config = require('../config/lti_config.json')

async function regPlatform(){
    var regResult = []
    for(var platform of lti_config.platform){
        if(platform.name && platform.key && platform.url){
            try{       
                var result = await lti.registerPlatform({
                    url: platform.url,
                    name: platform.name,
                    clientId: platform.key,
                    authenticationEndpoint: platform.url + '/mod/lti/auth.php',
                    accesstokenEndpoint: platform.url + '/mod/lti/token.php',
                    authConfig: { method: 'JWK_SET', key: platform.url + '/mod/lti/certs.php' }
                })
                regResult.push(result)
            }
            catch(err){
                console.error(err)
            }
        }
    }
    return regResult
}

exports.regPlatform = regPlatform