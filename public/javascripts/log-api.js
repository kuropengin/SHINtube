
function postLog(verb, obj=false){
    var request = new XMLHttpRequest()
    if(!obj){
        obj = params.get("video")
    }
    //console.log(verb, obj)
    request.open('POST', "/log" + "?ltik=" + params.get("ltik"), true)
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({"verb":verb,"obj":obj}))
}

function observarInit(){
    //ブラウザ関連
    postLog("access")

    lastcheck = document.hasFocus();
    setInterval( function () {
        var check = document.hasFocus() ;
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

    //video関連
    const video = document.querySelector('video')

    video.addEventListener('pause', (event) => {
        postLog("paused")
    })

    video.addEventListener('ended', (event) => {
        postLog("complete")
    })

    video.addEventListener('play', (event) => {
        postLog("play")
    })

    video.addEventListener('seeked', (event) => {
        postLog("skipped")
    })    
  
}


window.addEventListener("load", function() {
    observarInit()
})