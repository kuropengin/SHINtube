
var params = (new URL(document.location)).searchParams


var lmsProgressScore = 0
var lmsProgressList = []
function postVideoProgressInit(){
    const video = document.querySelector('video')
    var request = new XMLHttpRequest()
    request.open('GET', "/view-progress" + "?ltik=" + params.get("ltik"), true)

    request.onload = function () {
        var _score = 0
        var _comment = ""

        if(request.status == 200){
            savedProgress = JSON.parse(request.response)

            try{
                _score = savedProgress.scores[0].resultScore
            }
            catch(err){}
            
            try{
                _comment = savedProgress.scores[0].comment
            }
            catch(err){}

            if(_score < 100){
                lmsProgressScore = _score
                if(_comment){
                    lmsProgressList = _comment.split(',').map(ele => [parseFloat(ele.split('-')[0]), parseFloat(ele.split('-')[1])])
                    if(lmsProgressList.length){
                        video.currentTime = lmsProgressList[0][1]
                    }
                }


                window.addEventListener('beforeunload', (event) => {
                    postVideoProgress()
                })

                video.addEventListener('pause', (event) => {
                    postVideoProgress()
                })
            }
        }
    }
    request.send()
}

function postVideoProgress(){
    const video = document.querySelector('video')
    var view_sum = 0
    var temp_list = []
    var progress_list = []
    var send_list = []
    

    var using_list = Array(lmsProgressList.length).fill(1) 
    for(var i=0; i < video.played.length; i++){
        var _start = video.played.start(i)
        var _end = video.played.end(i)
        for(var j=0; j < lmsProgressList.length; j++){
            if(using_list[j] &&video.played.start(i) >= lmsProgressList[j][0] && video.played.end(i) <= lmsProgressList[j][1]){
                _start = lmsProgressList[j][0]
                _end = lmsProgressList[j][1]
                using_list[j] = 0
            }
            else if(using_list[j] &&video.played.start(i) <= lmsProgressList[j][0] && video.played.end(i) >= lmsProgressList[j][1]){
                using_list[j] = 0
            }
            else if(using_list[j] && video.played.start(i) >= lmsProgressList[j][0] && video.played.start(i) <= lmsProgressList[j][1]){
                _start = lmsProgressList[j][0]
                using_list[j] = 0
            }
            else if(using_list[j] &&video.played.end(i) >= lmsProgressList[j][0] && video.played.end(i) <= lmsProgressList[j][1]){
                _end = lmsProgressList[j][1]
                using_list[j] = 0
            }
        }
        temp_list.push([_start,_end])
    }
    var not_using_list = lmsProgressList.filter(function(value, index, self){
        return using_list[index] === 1
    })

    not_using_list.map(element => temp_list.push(element))
    temp_list.sort(sortFunction);
    //console.log(temp_list)

    using_list = Array(temp_list.length).fill(1) 
    for(var i=0; i < temp_list.length; i++){
        if(using_list[i]){
            var _start = temp_list[i][0]
            var _end = temp_list[i][1]
            for(var j=0; j < temp_list.length; j++){
                if(i != j){
                    if(using_list[j] && _end >= temp_list[j][0] && _end >= temp_list[j][1]){
                        using_list[j] = 0
                    }
                    else if(using_list[j] && _end >= temp_list[j][0]){
                        _end = temp_list[j][1]
                        using_list[j] = 0
                    }
                    else{
                        break
                    }
                }
            }
            progress_list.push([_start,_end])
        }
    }

    for(progress_one of progress_list){
        view_sum += progress_one[1] - progress_one[0]
        send_list.push(progress_one[0] + "-" + progress_one[1])
    }

    view_progress = Math.floor((view_sum / video.duration) * 100)
    
    if(view_progress > 100){
        view_progress = 100
    }

    if(lmsProgressScore < view_progress){
        var sendData = new FormData()
        sendData.append("score", view_progress)
        sendData.append("comment", send_list.join(','))

        var request = new XMLHttpRequest()
        request.open('POST', "/view-progress" + "?ltik=" + params.get("ltik"), true)
        request.send(sendData)
    }
}

function sortFunction(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? -1 : 1;
    }
}


function videoInit(){
    const video = document.querySelector('video')

    var _volume = localStorage.getItem("volume")
    
    if(!_volume){
        _volume = 1
    }
    
    if (player) {player.dispose()} else {var player}  
    player = videojs('video-player', {
        autoplay: false,
        loop: false,
        controls: true,
        preload: 'auto',
        playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
        poster: '/video/' + params.get("video") + '/thumbnail_720.jpg/?ltik=' + params.get("ltik")
    });

    player.src({
        type: 'application/x-mpegURL',
        src: "/video/" + params.get("video") + "/playlist.m3u8" + "?ltik=" + params.get("ltik")
    });

    player.hlsQualitySelector({
        displayCurrentQuality: true
    });

    video.volume = _volume
    video.onvolumechange = function(){
        localStorage.setItem('volume', video.volume)
    }

    /*safariサポート待ち
    videojs.options.hls.overrideNative = true;
    videojs.options.html5.nativeAudioTracks = false;
    videojs.options.html5.nativeVideoTracks = false;
    videojs.Hls.xhr.beforeRequest = function(options){
        options.uri += "?ltik=" + params.get("ltik")
    };
    */
}


function videoInfoInit(){
    var request = new XMLHttpRequest()
    request.open('GET', "/video/" + params.get("video") + "/info.json" + "?ltik=" + params.get("ltik"), true)

    request.onload = function () {
        var infodata = JSON.parse(request.response)
        var update_date = new Date(infodata.updated_at)
        var update_Year = update_date.getFullYear()
        var update_Month = (update_date.getMonth() + 1) < 10 ? "0" + (update_date.getMonth() + 1) : (update_date.getMonth() + 1) 
        var update_Date = update_date.getDate()
        document.getElementById("video-title").innerHTML = infodata.title
        document.getElementById("video-update").innerHTML += update_Year + "/" + update_Month  + "/" + update_Date
        document.getElementById("video-explanation").innerHTML = infodata.explanation ? infodata.explanation : "説明なし";
    }
    request.send()
}


function memoInit(){
    var easyMDE = new EasyMDE({
        element: document.getElementById("memo-editor"),
        showIcons: ['strikethrough', 'code', 'table', 'heading', 'horizontal-rule'],
        autosave: {
            enabled: true,
            uniqueId: params.get("video"),
            delay: 1000,
        },
        spellChecker: false
    })
    
    last_input_time = 0
    easyMDE.codemirror.on('change', () => {
        if(Date.now() - last_input_time >= (1000 * 60 * 0.25)){
            postLog("edit", params.get("video") + "/memo")
            last_input_time = Date.now()
        }
    })
    
    function download_list_display(){
        document.getElementById("memo-download-list").classList.toggle("memo-download-list-hidden")
    }

    function DownloadTXT() {
        var content = easyMDE.value();
        var blob = new Blob([ content ], { "type" : "text/plain" });

        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = document.getElementById("video-title").innerHTML + 'のメモ.txt';
        a.target = '_blank';
        a.click();

    }

    function DownloadHTML() {
        var content = "<html><head><title>" + document.getElementById("video-title").innerHTML + "のメモ</title></head><body>" + easyMDE.markdown(easyMDE.value()) + "</html>"
        
        var blob = new Blob([ content ], { "type" : "text/html" });

        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = document.getElementById("video-title").innerHTML + 'のメモ.html';
        a.target = '_blank';
        a.click();

    }

    /*
    //OSSの日本語対応待ち
    function DownloadPDF() {
        var content = "<html>" + easyMDE.markdown("<div style='font-family:Koruri;'>" + easyMDE.markdown(easyMDE.value()).slice( 19, -7 ) + "</div>") + "</html>"
        console.log(content)
        window.jsPDF = window.jspdf.jsPDF
        var doc = new jsPDF('p', 'px', 'a4');
        
        doc.setFont('Koruri', 'normal');

        doc.html(content, {
        callback: function (pdf) {
            doc.setFont('Koruri', 'normal');
            pdf.save(document.getElementById("video-title").innerHTML + 'のメモ.pdf');
        }
        });
    }
    */
    document.getElementById("memo-download-btn").addEventListener("click", download_list_display, false);
    document.addEventListener("click", (e) => {
        if( !e.target.closest("#memo-download-list") && !e.target.closest("#memo-download-btn") && 
            !document.getElementById("memo-download-list").classList.contains("memo-download-list-hidden")){
            download_list_display()
        } 
    })
    document.getElementById("download-type-txt").addEventListener("click", DownloadTXT, false);
    document.getElementById("download-type-html").addEventListener("click", DownloadHTML, false);
    //document.getElementById("download-type-pdf").addEventListener("click", DownloadPDF, false);
}


window.addEventListener("load", function() {
    videoInit()
    videoInfoInit()
    if(params.get("deeplink")){
        postVideoProgressInit()
    }
    memoInit()
})
    
