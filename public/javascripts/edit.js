const input_video_preview = document.getElementById('upload-video-preview')
const sleep = msec => new Promise(resolve => setTimeout(resolve, msec))

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
    console.log(input_video_file)
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
  request.open('GET', "/video/" + params.get("vid") + "/info.json?ltik=" + params.get("ltik"), true)

  request.onload = function () {
    ResponseData = JSON.parse(request.response)
    callback(ResponseData)
  }
  request.send()
}

function valueInit(InitData){

  var params = (new URL(document.location)).searchParams;

  document.getElementById('upload-title').value = InitData.title
  document.getElementById('upload-explanation').value = InitData.explanation
  document.getElementById('input_hidden_vid').value = params.get("vid")

  if (player) {player.dispose()} else {var player}  
  player = videojs('now-video-preview', {
    autoplay: false,
    loop: false,
    controls: true,
    preload: 'auto',
    playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
    poster: '/video/' + params.get("vid") + '/thumbnail_720.jpg/?ltik=' + params.get("ltik")
  })

  player.src({
    type: 'application/x-mpegURL',
    src: "/video/" + params.get("vid") + "/playlist.m3u8" + "?ltik=" + params.get("ltik")
  })

  player.hlsQualitySelector({
    displayCurrentQuality: true
  })
}

var upload_flag = false

function upload_video(){
  var required_check = false
  document.getElementById("title-non-err").innerHTML = ""

  const form = document.getElementById("upload-form")

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

  var xhr = new XMLHttpRequest()
  xhr.open('post', "/edit" + "?ltik=" + params.get("ltik"), true)

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
      window.location.href = "/videolist?ltik=" + params.get("ltik")
    })
  }


  if(!upload_flag){
    upload_flag = true
    xhr.send(fd)
  }
}

document.getElementById("upload-btn").addEventListener("click", upload_video, false)

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
  document.getElementById("title-input-limit").innerHTML = document.getElementById("upload-title").value.length
}
document.getElementById("upload-title").addEventListener('input', title_limit_change);

function exp_limit_change(){
  document.getElementById("exp-input-limit").innerHTML = document.getElementById("upload-explanation").value.length
}
document.getElementById("upload-explanation").addEventListener('input', exp_limit_change);

window.addEventListener("load", function() {
  getVideoInfoResponse(valueInit)
})