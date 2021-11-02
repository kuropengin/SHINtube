const lti = require('ltijs').Provider
const lti_config = require('../config/lti_config.json')

async function regPlatform(){
    for(var platform of lti_config.platform){
        if(platform.name && platform.key && platform.url){
            try{
                await lti.registerPlatform({
                    url: platform.url,
                    name: platform.name,
                    clientId: platform.key,
                    authenticationEndpoint: platform.url + '/mod/lti/auth.php',
                    accesstokenEndpoint: platform.url + '/mod/lti/token.php',
                    authConfig: { method: 'JWK_SET', key: platform.url + '/mod/lti/certs.php' }
                })
            }
            catch(err){
                console.error(err)
            }
        }
    }
}

exports.regPlatform = regPlatform