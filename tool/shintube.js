const lti = require('ltijs').Provider
const db_config = require('../config/db_config.json')

const DB_URL = db_config.mongo_url || process.env.DB_URL || "mongo"
const DB_NAME = db_config.db_name || process.env.DB_NAME || "SHINtube"
const DB_USER = db_config.user || process.env.DB_USER || "root"
const DB_PASS = db_config.pass || process.env.DB_PASS || "pass"

const platform = require('./platform')
const system = require('./system')

async function reload(){
    var regResult = await platform.regPlatform()
    for(let p of regResult){
        console.log(await p.platformJSON())
    }
    return
}

async function systemCheck(){
    await system.check()
    return
}


async function main(){
    lti.setup('LTIKEY',
        {
            url: 'mongodb://' + DB_URL + '/' + DB_NAME + '?authSource=admin',
            connection: { user: DB_USER, pass: DB_PASS }
        }
    )
    await lti.deploy({ serverless: true })
    try{
        if(process.argv[2] == "reload"){
            await reload()
        }
        else if(process.argv[2] == "system"){
            await systemCheck()
        }
        else{
            throw "command not found"
        }
    }
    catch(err){
        console.log(err)
    }
    process.exit(1)
}

main()