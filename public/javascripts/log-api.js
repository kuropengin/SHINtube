
function postLog(verb, obj=false, obj_ex=false){
    let request = new XMLHttpRequest()

    if(!obj){
        obj = params.get("video")
    }
        
    //console.log(verb, obj)
    request.open('POST', "./log" + "?ltik=" + params.get("ltik"), true)
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({"verb":verb, "obj":obj, "obj_ex":obj_ex}))
}

function observarWindowInit(){
    //ブラウザ関連
    const now_path = location.pathname.split("/").slice(-1)[0]
    if(now_path == "watch"){
        postLog("access")

        lastcheck = document.hasFocus();
        setInterval( function () {
            let check = document.hasFocus() ;
            if ( lastcheck !== check ) {
                lastcheck = check;
                if(check){
                    postLog("active")
                }
                else{
                    postLog("inactive")
                }
            }
        }, 300 );

        window.addEventListener('beforeunload', (event) => {
            postLog("terminate")
        })
    }
}

function observarVideoInit(){
    const now_path = location.pathname.split("/").slice(-1)[0]
    if(now_path == "watch"){
        player.on('pause', (event) => {
            postLog("paused", false, {"position":player.currentTime()})
        })

        player.on('ended', (event) => {
            postLog("complete")
        })

        player.on('play', (event) => {
            postLog("play", false, {"position":player.currentTime()})
        })

        player.on('seeked', (event) => {
            postLog("skipped", false, {"position":player.currentTime()})
        })
    }   
}

window.addEventListener("load", function() {
    observarWindowInit()
})