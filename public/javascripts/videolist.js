var video_dict = {}


function redraw_video_list(){
  videofilter.filterword = document.getElementById("filter-word").value
  video_list_draw(videofilter.VideoList())
}


function video_list_draw(video_view_list){
  var params = (new URL(document.location)).searchParams
  document.getElementById("videolist").remove()
  var video_list_div = document.createElement("div")
  video_list_div.setAttribute("id","videolist")
  document.getElementById("videolist-area").prepend(video_list_div)

  for (const element in video_view_list) {
    var video_div = document.createElement("div")
    video_div.setAttribute("id","video-" + video_view_list[element].vid)
    video_div.setAttribute("class","video_div")

    var thumbnail_div = document.createElement("div")
    thumbnail_div.setAttribute("class","head-thumbnail")
    var img_a = document.createElement('a')
    img_a.href = '/watch?video=' + video_view_list[element].vid + '&ltik=' + params.get("ltik")
    var img_thumbnail = document.createElement('img')
    img_thumbnail.src = '/video/' + video_view_list[element].vid + '/' + 'thumbnail_360.jpg?ltik=' + params.get("ltik")
    img_thumbnail.onerror = function(){
      this.src='/images/no_thumbnail.jpg'
    }
    img_thumbnail.alt = video_view_list[element].title
    thumbnail_div.appendChild(img_thumbnail)
    thumbnail_div.appendChild(img_a)
    video_div.appendChild(thumbnail_div)

    var title_div = document.createElement("div")
    title_div.setAttribute("class","head-title")
    var p_title = document.createElement("p")
    p_title.innerHTML = video_view_list[element].title
    title_div.appendChild(p_title)
    video_div.appendChild(title_div)

    var explanation_div = document.createElement("div")
    explanation_div.setAttribute("class","head-explanation")
    var p_explanation = document.createElement("p")
    p_explanation.innerHTML = video_view_list[element].explanation
    explanation_div.appendChild(p_explanation)
    video_div.appendChild(explanation_div)

    var status_div = document.createElement("div")
    status_div.setAttribute("class","head-status")
    var p_status = document.createElement("p")
    if(video_view_list[element].encode_error.length){
      p_status.setAttribute("class","status-now")
      p_status.innerHTML = "エンコードエラー"
      p_status.title = "動画を削除して再度エンコードを行うか、管理者までお問い合わせください"
    }
    else if(video_view_list[element].encode_tasks.length){
      p_status.setAttribute("class","status-now")
      p_status.innerHTML = "エンコード中"
      p_status.title = video_view_list[element].encode_tasks
    }
    else if(video_view_list[element].resolution.length == 0 && video_view_list[element].encode_tasks.length == 0){
      p_status.setAttribute("class","status-now")
      p_status.innerHTML = "処理中"
      p_status.title = "エンコード開始までしばらくお待ちください"
    }
    else{
      p_status.setAttribute("class","status-ed")
      p_status.innerHTML = "エンコード済み"
      p_status.title = video_view_list[element].resolution
    }
    status_div.appendChild(p_status)
    video_div.appendChild(status_div)

    var operation_div = document.createElement("div")
    operation_div.setAttribute("class","head-operation")
    var div_edit = document.createElement("div")
    div_edit.setAttribute("id","edit-" + video_view_list[element].vid)
    div_edit.innerHTML = "編集"
    if(video_view_list[element].encode_error.length){
      div_edit.setAttribute("class","operation-btn edit-lock")
    }
    else if(video_view_list[element].encode_tasks.length){
      div_edit.setAttribute("class","operation-btn edit-lock")
    }
    else if(video_view_list[element].resolution.length == 0 && video_view_list[element].encode_tasks.length == 0){
      div_edit.setAttribute("class","operation-btn edit-lock")
    }
    else{
      div_edit.setAttribute("class","operation-btn status-ed")
      div_edit.onclick = videoEdit
    }
    operation_div.appendChild(div_edit)
    var div_delete = document.createElement("div")
    div_delete.setAttribute("id","delete-" + video_view_list[element].vid)
    div_delete.setAttribute("class","operation-btn")
    div_delete.innerHTML = "削除"
    if(video_view_list[element].encode_error.length){
      div_delete.setAttribute("class","operation-btn status-now")
      div_delete.onclick = videoDelete
    }
    else if(video_view_list[element].encode_tasks.length){
      div_delete.setAttribute("class","operation-btn delete-lock")
    }
    else if(video_view_list[element].resolution.length == 0 && video_view_list[element].encode_tasks.length == 0){
      div_delete.setAttribute("class","operation-btn delete-lock")
    }
    else{
      div_delete.setAttribute("class","operation-btn status-now")
      div_delete.onclick = videoDelete
    }
    
    operation_div.appendChild(div_delete)
    video_div.appendChild(operation_div)

    video_list_div.appendChild(video_div)
  }
}

function uploadInit(){
  var params = (new URL(document.location)).searchParams
  var upload_a = document.createElement('a')
  upload_a.href = '/upload?&ltik=' + params.get("ltik")
  document.getElementById("upload-btn").appendChild(upload_a)
}



var selectVid = ""
function videoDelete(e){
  var e = e || window.event
  var elem = e.target || e.srcElement
  var vid = elem.id.split('-')[1]
  selectVid = vid
  var params = (new URL(document.location)).searchParams

  document.getElementById("delete-overlay").classList.toggle("delete-overlay-on")
  document.getElementById("delete-thumbnail").src = '/video/' + vid + '/' + 'thumbnail_360.jpg?ltik=' + params.get("ltik")
  document.getElementById("delete-thumbnail").onerror = function(){
    this.src='/images/no_thumbnail.jpg'
  }
  document.getElementById("delete-title").innerHTML = video_dict[vid].title
  document.getElementById("delete-cancel-btn").onclick = deleteCancel
  document.getElementById("delete-run-btn").onclick = deleteRun
}

function deleteCancel(){
  document.getElementById("delete-overlay").classList.toggle("delete-overlay-on")
  selectVid = ""
}

function deleteRun(){
  if(selectVid){
    var xhr = new XMLHttpRequest();
    var params = (new URL(document.location)).searchParams
    var send_json = {"vid":selectVid}
    xhr.open('post', "/videodelete?ltik=" + params.get("ltik"), true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify(send_json))

    xhr.onload = function () {
      if(xhr.status == 200){
        document.getElementById("delete-overlay").classList.toggle("delete-overlay-on")
        document.getElementById("video-" + selectVid).remove()

        delete video_dict[selectVid]
        var video_array = Object.keys(video_dict).map((k)=>( Object.assign( { "vid": k }, video_dict[k] )))
        videofilter.updateOrigin = video_array
        video_list_draw(videofilter.VideoList())
      }
    }
  }
}

function videoEdit(e){
  var e = e || window.event
  var elem = e.target || e.srcElement
  var vid = elem.id.split('-')[1]
  var params = (new URL(document.location)).searchParams

  window.location.href = "/edit?vid=" + vid + "&ltik=" + params.get("ltik")
}


function getVideoList(){
    var request = new XMLHttpRequest()
    var params = (new URL(document.location)).searchParams
    request.open('POST', "/videolist?ltik=" + params.get("ltik"), true)
  
    request.onload = function () {
      var listdata = JSON.parse(request.response)
      video_dict = listdata
      var video_array = Object.keys(listdata).map((k)=>( Object.assign( { "vid": k }, listdata[k] )))
      videofilter.updateOrigin = video_array
      video_list_draw(videofilter.VideoList())
      document.getElementById("filter-word").addEventListener('input', redraw_video_list)
    }
    request.send()
}


function classNameInit(InitData){
    document.getElementById("class-name").innerHTML = InitData.context.label + "のコンテンツ"
}





window.addEventListener("load", function() {
    getLtiInfoResponse(classNameInit)
    getVideoList()
    uploadInit()
})

