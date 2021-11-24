const input_video_preview = document.getElementById('upload-video-preview')
const sleep = msec => new Promise(resolve => setTimeout(resolve, msec))
var encoding_flag = false

async function show_input_video_preview(input_video_file) {
  if(input_video_file){
    document.getElementById('upload-video-preview').classList.remove("display-off")
    document.getElementById('now-video-preview').classList.add("display-off")
  }
  else{
    document.getElementById('upload-video-preview').classList.add("display-off")
    document.getElementById('now-video-preview').classList.remove("display-off")
  }
  input_video_preview.src = URL.createObjectURL(
      new Blob(
          [input_video_file],
          { type: 'video/mp4' }
      )
  )
  await sleep(1000)
  input_video_preview.currentTime = 0
  input_video_preview.controls = true
}

async function load_video({ target: { files } }) {
    input_video_file = files[0]
    await show_input_video_preview(input_video_file)
    if(input_video_file){
      select_file_info_show(input_video_file.name)
    }
}

async function drop_load_video({ dataTransfer: { files } }) {
    input_video_file = files[0]
    await show_input_video_preview(input_video_file)
    if(input_video_file){
      select_file_info_show(input_video_file.name)
    }
}

var fileArea = document.getElementById('drag-area')
var fileInput = document.getElementById('uploader')

fileArea.addEventListener('dragover', function (e) {
  e.preventDefault()
  fileArea.classList.add('dragover')
});

fileArea.addEventListener('dragleave', function (e) {
  e.preventDefault()
  fileArea.classList.remove('dragover')
});


fileArea.addEventListener('drop', function (e) {
  e.preventDefault()
  fileArea.classList.remove('dragover')

  var files = e.dataTransfer.files

  fileInput.files = files
  var file = files[0]
  if (typeof e.dataTransfer.files[0] !== 'undefined') {
    if (file.type.match("video.*") || file.type.match("image.gif")) {
      console.log("ロード完了")
    }
    else {
      console.log("動画を選択してください")
    }
  } 
  else {
    console.log("ファイルが選択されませんでした")
  }
})

document.getElementById('uploader').addEventListener('change', load_video)
document.getElementById('drag-area').addEventListener('drop', drop_load_video)
var params = (new URL(document.location)).searchParams


function getVideoInfoResponse(callback){
  var request = new XMLHttpRequest()
  var params = (new URL(document.location)).searchParams
  request.open('GET', "./video/" + params.get("vid") + "/info.json?ltik=" + params.get("ltik") + "&datte=" + new Date().getTime(), true)

  request.onload = function () {
    ResponseData = JSON.parse(request.response)
    try{
      ResponseData.meta_data = JSON.parse(ResponseData.meta_data)
    }
    catch(e){
      ResponseData.meta_data = {}
    }
    
    callback(ResponseData)
  }
  request.send()
}

function valueInit(InitData){

  var params = (new URL(document.location)).searchParams;

  document.getElementById('upload-title').value = InitData.title
  document.getElementById('upload-explanation').value = InitData.explanation
  document.getElementById('input_hidden_vid').value = params.get("vid")

  if(InitData.encode_error.length){
    encoding_flag = false
  }
  else if(InitData.encode_tasks.length){
    encoding_flag = false
  }
  else if(InitData.resolution.length == 0 && InitData.encode_tasks.length == 0){
    encoding_flag = false
  }
  else{
    encoding_flag = true
  }

  var edit_content_type = ""
  try{
    edit_content_type = InitData.meta_data.content_type || "video"
  }
  catch(e){
    edit_content_type = "video"
  }

  if(edit_content_type == "video"){
    if(encoding_flag){
      if (player) {player.dispose()} else {var player}  
      player = videojs('now-video-preview', {
        autoplay: false,
        loop: false,
        controls: true,
        preload: 'auto',
        playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
        poster: './video/' + params.get("vid") + '/thumbnail_720.jpg?ltik=' + params.get("ltik")
      })

      player.src({
        type: 'application/x-mpegURL',
        src: "./video/" + params.get("vid") + "/playlist.m3u8" + "?ltik=" + params.get("ltik")
      })

      player.hlsQualitySelector({
        displayCurrentQuality: true
      })
    }
    else{
      document.getElementById("encoding-block").classList.add("drag-area-block-on")
      document.getElementById("drag-area").classList.remove("drag-area-block-on")
      document.getElementById("drag-area-block").classList.remove("drag-area-block-on")
    }

    document.getElementById("upload-btn").addEventListener("click", upload_video, false)
    document.getElementById("cancel-btn").addEventListener("click", function(){
      window.location.href = "./videolist?ltik=" + params.get("ltik")
    }, false)
  }
  else if(edit_content_type == "playlist"){
    document.getElementById("video-step").classList.add("display-off")
    document.getElementById("upload-video-preview").classList.add("display-off")
    document.getElementById("now-video-preview").classList.add("display-off")
    document.getElementById("playlist-area").classList.remove("display-off")

    const sortElement = document.getElementById('playlist-sort')
    Sortable.create(sortElement,{
      onSort: listIndexSort
    })

    playlistInit(InitData)

    document.getElementById("upload-btn").addEventListener("click", upload_list, false)
    document.getElementById("cancel-btn").addEventListener("click", function(){
      window.location.href = "./videolist?ltik=" + params.get("ltik") + "#listCategory"
    }, false)
  }


  title_limit_change()
  exp_limit_change()
}

function playlistInit(playlist_info, playlist_id=params.get("playlist")){

  const list_element = document.getElementById("playlist-sort")
  const playlist_content = document.querySelector('#template-playlist-content').content
  const playlist = playlist_info.meta_data.playlist

  playlist.forEach(function(playlist_vid, index){
      const clone = document.importNode(playlist_content, true)

      const playlist_div = clone.querySelector('.playlist-content-div')
      playlist_div.setAttribute("id","playlist-" + playlist_vid)

      const index_div = clone.querySelector('.playlist-content-index')
      index_div.innerHTML = index + 1

      const thumbnail_img = clone.querySelector('.playlist-content-thumbnail-img')
      thumbnail_img.src = './video/' + playlist_vid + '/' + 'thumbnail_360.jpg?ltik=' + params.get("ltik")
      thumbnail_img.onerror = function(){
          this.src = './images/no_thumbnail.jpg'
      }

      const title_div = clone.querySelector('.playlist-content-info-title')
      title_div.setAttribute("id","playlist-title-" + playlist_vid)

      const explanation_div = clone.querySelector('.playlist-content-info-explanation')
      explanation_div.setAttribute("id","playlist-explanation-" + playlist_vid)

      const delete_div = clone.querySelector('.playlist-content-delete-btn')
      delete_div.setAttribute("id","delete-" + playlist_vid)
      delete_div.onclick = deleteList

      list_element.appendChild(clone)
      playlistVideoInfo(playlist_vid)
  })

  const video = document.querySelector('video')

  var next_index = 1
  if(params.get("index")){
      next_index = Number(params.get("index"))
  }

  if(playlist.length > next_index){
      video.addEventListener('ended', (event) => {
          location.href = './watch?video=' + playlist[next_index] + '&playlist=' + playlist_id + '&index=' + (next_index + 1) + '&ltik=' + params.get("ltik")
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
      }
      else{
          document.getElementById("playlist-title-" + vid).innerHTML = "取得できませんでした"
      }
  }
  
  request.send()
}

function listIndexSort(evt) {
  var items = document.getElementsByClassName("playlist-content-div")
  for (var i = 0; i < items.length; i++) {
    items[i].querySelector('.playlist-content-index').innerHTML = i + 1
  }
}


var upload_flag = false

function upload_video(){
  var required_check = false
  document.getElementById("title-non-err").innerHTML = ""

  const form = document.getElementById("upload-form")
  if(form.in_file.value && !encoding_flag){
    form.in_file.value = ""
  }

  if(!form.title.value){
    required_check = true
    form.title.parentNode.parentNode.classList.add("required_input")
    document.getElementById("title-non-err").innerHTML = "動画タイトルを入力してください"
  }
  else{
    form.title.parentNode.parentNode.classList.remove("required_input")
  }

  if(required_check){
    return
  }

  document.getElementById("upload-overlay").classList.toggle("on-overlay")
  document.getElementById("upload-btn").removeEventListener("click", upload_video, false)
  
  const fd = new FormData(form)

  if(form.in_file.value){
    try{
        const up_duration = document.getElementById("upload-video-preview").duration
        if(up_duration){
            fd.append("duration", up_duration)
        }
        else{
            fd.append("duration", 0)
        }
    }
    catch(e){
        fd.append("duration", 0)
    }
  }

  var xhr = new XMLHttpRequest()
  xhr.open('post', "./edit" + "?ltik=" + params.get("ltik"), true)

  xhr.upload.addEventListener('progress', (evt) => {
    let percent = (evt.loaded / evt.total * 100).toFixed(1)
    document.getElementById('upload-percent').textContent = percent
    bar.animate(percent/100)
    console.log(`++ xhr.upload: progress ${percent}%`)
  });

  xhr.upload.addEventListener('timeout', (evt) => {
    document.getElementById("upload-info").innerHTML = "タイムアウトしました"
    console.log('++ xhr.upload: timeout')
  })

  xhr.onload = function () {
    if(xhr.status == 200){
      document.getElementById("upload-info").innerHTML = "反映が完了しました"
    }
    else{
      document.getElementById("upload-info").innerHTML = "<font color='red'>反映に失敗しました</font>"
    }

    document.getElementById("back-btn").classList.toggle("lock-btn")
    document.getElementById("back-btn").addEventListener('click', function(){
      window.location.href = "./videolist?ltik=" + params.get("ltik")
    })

    document.getElementById("reedit-btn").classList.toggle("lock-btn")
    document.getElementById("reedit-btn").addEventListener('click', function(){
      window.location.reload()
    })
  }

  if(!upload_flag){
    upload_flag = true
    xhr.send(fd)
  }
}

function upload_list(){
  var required_check = false
  document.getElementById("title-non-err").innerHTML = ""

  const form = document.getElementById("upload-form")
  if(form.in_file.value && !encoding_flag){
    form.in_file.value = ""
  }

  if(!form.title.value){
    required_check = true
    form.title.parentNode.parentNode.classList.add("required_input")
    document.getElementById("title-non-err").innerHTML = "タイトルを入力してください"
  }
  else{
    form.title.parentNode.parentNode.classList.remove("required_input")
  }

  if(required_check){
    return
  }

  document.getElementById("upload-overlay").classList.toggle("on-overlay")
  document.getElementById("upload-btn").removeEventListener("click", upload_list, false)
  
  const fd = new FormData(form)

  var xhr = new XMLHttpRequest()
  xhr.open('post', "./updateplaylist?ltik=" + params.get("ltik"), true)

  xhr.upload.addEventListener('progress', (evt) => {
    let percent = (evt.loaded / evt.total * 100).toFixed(1)
    document.getElementById('upload-percent').textContent = percent
    bar.animate(percent/100)
    console.log(`++ xhr.upload: progress ${percent}%`)
  });

  xhr.upload.addEventListener('timeout', (evt) => {
    document.getElementById("upload-info").innerHTML = "タイムアウトしました"
    console.log('++ xhr.upload: timeout')
  })

  xhr.onload = function () {
    if(xhr.status == 200){
      document.getElementById("upload-info").innerHTML = "反映が完了しました"
    }
    else{
      document.getElementById("upload-info").innerHTML = "<font color='red'>反映に失敗しました</font>"
    }

    document.getElementById("back-btn").classList.toggle("lock-btn")
    document.getElementById("back-btn").addEventListener('click', function(){
      window.location.href = "./videolist?ltik=" + params.get("ltik") + "#listCategory"
    })

    document.getElementById("reedit-btn").classList.toggle("lock-btn")
    document.getElementById("reedit-btn").addEventListener('click', function(){
      window.location.reload()
    })
  }

  if(!upload_flag){
    upload_flag = true

    var items = document.getElementsByClassName("playlist-content-div")
    var send_playlist = []
    for (var i = 0; i < items.length; i++) {
      send_playlist.push(items[i].id.split("-")[1])
    }

    var send_json = {
      "title": form.title.value,
      "explanation": form.title.explanation || "",
      "playlist" : send_playlist,
      "vid" : params.get("vid")
    }
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify(send_json))
  }
}

function deleteList(e){
  var e = e || window.event
  var elem = e.target || e.srcElement
  var vid = elem.id.split('-')[1]
  document.getElementById("playlist-" + vid).remove()
  listIndexSort()
}


function select_file_info_show(file){
  document.getElementById("input_file_name").innerHTML = file
  document.getElementById("drag-area").classList.toggle("drag-area-block-on")
  document.getElementById("drag-area-block").classList.toggle("drag-area-block-on")
}

function re_select_file_info(){
  document.getElementById("drag-area-block").classList.toggle("drag-area-block-on")
  document.getElementById("drag-area").classList.toggle("drag-area-block-on")
  document.getElementById('uploader').value = ""
  document.getElementById('upload-video-preview').src=""
  document.getElementById('upload-video-preview').classList.add("display-off")
  document.getElementById('now-video-preview').classList.remove("display-off")
}
document.getElementById("re-select-btn").addEventListener("click", re_select_file_info, false)

function title_limit_change(){
  if(document.getElementById("upload-title").value.length > 40){
      document.getElementById("upload-title").value = document.getElementById("upload-title").value.slice(0,40)
  }
  document.getElementById("title-input-limit").innerHTML = document.getElementById("upload-title").value.length
}
document.getElementById("upload-title").addEventListener('input', title_limit_change);

function exp_limit_change(){
  if(document.getElementById("upload-explanation").value.length > 200){
      document.getElementById("upload-explanation").value = document.getElementById("upload-explanation").value.slice(0,200)
  }
  document.getElementById("exp-input-limit").innerHTML = document.getElementById("upload-explanation").value.length
}
document.getElementById("upload-explanation").addEventListener('input', exp_limit_change);

window.addEventListener("load", function() {
  getVideoInfoResponse(valueInit)
})