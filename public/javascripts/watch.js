
var params = (new URL(document.location)).searchParams

var lmsProgressScore = 0
var lmsProgressList = []

var playListVid = []
function postVideoProgressInit(vid){
    const video = document.querySelector('video')
    var request = new XMLHttpRequest()
    request.open('GET', "./view-progress" + "?vid=" + vid + "&ltik=" + params.get("ltik"), true)

    request.onload = function () {
        var _score = 0
        var _comment = ""

        if(request.status == 200){
            savedProgress = JSON.parse(request.response)
            
            try{
                _score = savedProgress.scores[0].resultScore || 0
            }
            catch(err){}
            
            try{
                _comment = savedProgress.scores[0].comment || ""
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


                window.addEventListener('beforeunload', async function(event){
                    const video = document.querySelector('video')
                    if(!video.paused){
                        postVideoProgress(vid)
                    }  
                })

                video.addEventListener('pause', (event) => {
                    postVideoProgress(vid)
                })
            }
        }

        document.getElementById("video-progress").innerHTML = _score + "%視聴完了"
    }
    request.send()
}

async function postVideoProgress(vid){
    const video = document.querySelector('video')

    var clientProgressList = []
    for(var i=0; i < video.played.length; i++){
        clientProgressList.push([video.played.start(i),video.played.end(i)])
    }
    const allProgressList = lmsProgressList.concat(clientProgressList)
    allProgressList.sort(sortFunction)

    var mergedProgressList = []
    mergedProgressList.push(allProgressList[0])
    
    for(const _temp of allProgressList){
        if(_temp[0] > mergedProgressList[mergedProgressList.length - 1][1]){
            mergedProgressList.push(_temp)
        }
        else if(_temp[1] > mergedProgressList[mergedProgressList.length - 1][1]){
            mergedProgressList[mergedProgressList.length - 1][1] = _temp[1]
        } 
    }


    var view_sum = 0
    var send_list = []
    for(const progress_one of mergedProgressList){
        view_sum += progress_one[1] - progress_one[0]
        send_list.push(progress_one[0] + "-" + progress_one[1])
    }

    let view_progress = Math.floor((view_sum / video.duration) * 100)
    view_progress = view_progress > 100 ? 100 : view_progress

    if(lmsProgressScore < view_progress){
        var sendData = {
            "vid": vid,
            "duration": video.duration,
            "playlist": playListVid.length ? playListVid : false,
            "score": view_progress,
            "comment": send_list.join(',')
        }

        var request = new XMLHttpRequest()
        request.open('POST', "./view-progress" + "?ltik=" + params.get("ltik"), true)

        request.onload = function () {
            if(request.status == 200){
                const lmsResult = JSON.parse(JSON.parse(request.response).comment)
                lmsProgressScore = lmsResult[vid].score
                lmsProgressList = lmsResult[vid].view_list.split(',').map(ele => [parseFloat(ele.split('-')[0]), parseFloat(ele.split('-')[1])])
                document.getElementById("video-progress").innerHTML = lmsResult[vid].score + "%視聴完了"
            }
            return
        }


        request.setRequestHeader('Content-Type', 'application/json')
        request.send(JSON.stringify(sendData))
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


function videoInit(vid){
    const video = document.querySelector('video')

    var _volume = localStorage.getItem("volume")
    
    if(!_volume){
        _volume = 1
    }
    if (player) {player.dispose()} else {var player}  
    player = videojs('video-player', {
        autoplay: params.get("index")? true : false,
        loop: false,
        controls: true,
        playsinline : true,
        preload: 'metadata',
        playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
        poster: './video/' + vid + '/thumbnail_720.jpg?ltik=' + params.get("ltik"),
        userActions: {
            hotkeys: true
        }
    });

    player.src({
        type: 'application/x-mpegURL',
        src: "./video/" + vid + "/playlist.m3u8" + "?ltik=" + params.get("ltik")
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


function videoInfoInit(vid){
    var request = new XMLHttpRequest()
    request.open('GET', "./video/" + vid + "/info.json" + "?ltik=" + params.get("ltik"), true)

    request.onload = function () {
        var infodata = JSON.parse(request.response)
        try{
            infodata.meta_data = JSON.parse(infodata.meta_data)
        }
        catch(err){
            infodata.meta_data = {
                "content_type" : "video"
            }
        }
        if(infodata.meta_data.content_type == "playlist"){
            if(!params.get("playlist") || params.get("playlist") == params.get("video")){
                if(infodata.meta_data.playlist.length){
                    videoInfoInit(infodata.meta_data.playlist[0])
                }
                else{
                    var update_date = new Date(infodata.updated_at)
                    var update_Year = update_date.getFullYear()
                    var update_Month = (update_date.getMonth() + 1) < 10 ? "0" + (update_date.getMonth() + 1) : (update_date.getMonth() + 1) 
                    var update_Date = update_date.getDate()
                    document.getElementById("video-title").innerHTML = infodata.title
                    document.getElementById("video-update").innerHTML += update_Year + "/" + update_Month  + "/" + update_Date
                    document.getElementById("video-explanation").innerHTML = infodata.explanation ? infodata.explanation : "説明なし";
                    memoInit(vid)
                }
            }
            else{
                videoInfoInit(params.get("video"))
            }
            
            playlistInit(infodata,vid)
        }
        else{
            var update_date = new Date(infodata.updated_at)
            var update_Year = update_date.getFullYear()
            var update_Month = (update_date.getMonth() + 1) < 10 ? "0" + (update_date.getMonth() + 1) : (update_date.getMonth() + 1) 
            var update_Date = update_date.getDate()
            document.getElementById("video-title").innerHTML = infodata.title
            document.getElementById("video-update").innerHTML += update_Year + "/" + update_Month  + "/" + update_Date
            document.getElementById("video-explanation").innerHTML = infodata.explanation ? infodata.explanation : "説明なし";

            if(params.get("deeplink")){
                postVideoProgressInit(vid)
            }
            videoInit(vid)
            memoInit(vid)
        }
    }
    request.send()
}


function memoInit(vid){
    var easyMDE = new EasyMDE({
        element: document.getElementById("memo-editor"),
        showIcons: ['strikethrough', 'code', 'table', 'heading', 'horizontal-rule'],
        autosave: {
            enabled: true,
            uniqueId: vid,
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


function playlistInit(playlist_info, playlist_id=params.get("playlist")){
    document.getElementById("playlist-area").classList.remove("playlist-none")

    document.getElementById("playlist-info-title").innerHTML = playlist_info.title
    if(playlist_info.meta_data.playlist.length){
        document.getElementById("playlist-info-index").innerHTML = (params.get("index") ? params.get("index") : "1") + " / " + playlist_info.meta_data.playlist.length
    }
    else{
        document.getElementById("playlist-info-index").innerHTML = "再生リストに動画がありません"
    }

    const list_element = document.getElementById("playlist-list")
    const playlist_content = document.querySelector('#template-playlist-content').content
    const playlist = playlist_info.meta_data.playlist

    playListVid = []

    playlist.forEach(function(playlist_vid, index){
        playListVid.push(playlist_vid)
        const clone = document.importNode(playlist_content, true)

        const playlist_div = clone.querySelector('.playlist-content-div')
        if(!params.get("index") && index == 0){
            playlist_div.classList.add("playing-content")
        }
        else if(params.get("index") == index + 1){
            playlist_div.classList.add("playing-content")
        }

        const index_div = clone.querySelector('.playlist-content-index')
        index_div.innerHTML = index + 1

        const thumbnail_img = clone.querySelector('.playlist-content-thumbnail-img')
        thumbnail_img.src = './video/' + playlist_vid + '/' + 'thumbnail_360.jpg?ltik=' + params.get("ltik")
        thumbnail_img.onerror = function(){
            this.src = './images/no_thumbnail.jpg'
        }

        const thumbnail_ps = clone.querySelector('.playlist-content-thumbnail-ps')
        thumbnail_ps.setAttribute("id","playlist-ps-" + playlist_vid)
        thumbnail_ps.innerHTML = "00:00"

        const title_div = clone.querySelector('.playlist-content-info-title')
        title_div.setAttribute("id","playlist-title-" + playlist_vid)

        const explanation_div = clone.querySelector('.playlist-content-info-explanation')
        explanation_div.setAttribute("id","playlist-explanation-" + playlist_vid)

        const a_div = clone.querySelector('.playlist-content-a')
        if(params.get("deeplink")){
            a_div.href = './watch?video=' + playlist_vid + '&playlist=' + playlist_id + '&deeplink=true&index=' + (index + 1) + '&ltik=' + params.get("ltik")
        }
        else{
            a_div.href = './watch?video=' + playlist_vid + '&playlist=' + playlist_id + '&index=' + (index + 1) + '&ltik=' + params.get("ltik")
        }
        

        list_element.appendChild(clone)
        playlistVideoInfo(playlist_vid)
    })

    const video = document.querySelector('video')

    var next_index = 1
    if(params.get("index")){
        next_index = Number(params.get("index"))
    }

    if(playlist.length > next_index){
        video.addEventListener('ended', async function(event){
            //await postVideoProgress(playlist[next_index - 1])
            if(params.get("deeplink")){
                location.href = './watch?video=' + playlist[next_index] + '&playlist=' + playlist_id + '&deeplink=true&index=' + (next_index + 1) + '&ltik=' + params.get("ltik")
            }
            else{
                location.href = './watch?video=' + playlist[next_index] + '&playlist=' + playlist_id + '&index=' + (next_index + 1) + '&ltik=' + params.get("ltik")
            }
        })
    }

}


function playlistVideoInfo(vid){
    var request = new XMLHttpRequest()
    request.open('GET', "./video/" + vid + "/info.json" + "?ltik=" + params.get("ltik"), true)

    request.onload = function () {
        if(request.status == 200){
            var infodata = JSON.parse(request.response)
            document.getElementById("playlist-title-" + vid).innerHTML = infodata.title

            var res_meta_data = {}
            try{
                res_meta_data = JSON.parse(infodata.meta_data)
                if(res_meta_data.duration){
                    const _s = Math.floor(res_meta_data.duration)
                    var H = Math.floor(_s % (24 * 60 * 60) / (60 * 60))
                    var M = Math.floor(_s % (24 * 60 * 60) % (60 * 60) / 60)
                    var S = _s % (24 * 60 * 60) % (60 * 60) % 60
                    if(H){
                        document.getElementById("playlist-ps-" + vid).innerHTML = H + ":" + M + ":" + S
                    }
                    else{
                        document.getElementById("playlist-ps-" + vid).innerHTML = M + ":" + ("0" + S).slice(-2)
                    }

                }
            }
            catch(e){}
            
        }
        else{
            document.getElementById("playlist-title-" + vid).innerHTML = "取得できませんでした"
        }
    }
    
    request.send()
}


window.addEventListener("load", function() {
    videoInfoInit(params.get("playlist") || params.get("video"))
})
    
