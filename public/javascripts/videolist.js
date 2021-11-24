var video_dict = {}
var selectVid = []

function resolutionSort(a, b) {
  return parseInt(a) - parseInt(b)
}

function redraw_video_list(){
  videofilter.filterword = document.getElementById("filter-word").value
  video_list_draw(videofilter.VideoList())
}

function video_list_draw(video_view_list){
  //console.log(video_view_list)
  var params = (new URL(document.location)).searchParams
  document.getElementById("videolist").remove()
  var video_list_div = document.createElement("div")
  video_list_div.setAttribute("id","videolist")
  document.getElementById("videolist-area").prepend(video_list_div)

  const video_content = document.querySelector('#template-video').content

  const selected_category = location.hash == "#listCategory" ? "playlist" : "video" 

  for (const element in video_view_list) {
    if(video_view_list[element].content_type != selected_category){
      continue
    }
    const clone = document.importNode(video_content, true)

    const check_div = clone.querySelector('.list-checkbox')
    check_div.setAttribute("id","check-" + video_view_list[element].vid)

    const label_div = clone.querySelector('.checkbox-label')
    label_div.setAttribute("for","check-" + video_view_list[element].vid)
    
    const video_div = clone.querySelector('.video_div')
    video_div.setAttribute("id","video-" + video_view_list[element].vid)

    const thumbnail_img = clone.querySelector('.head-thumbnail-img')
    if(video_view_list[element].content_type == "playlist"){
      try{
        thumbnail_img.src = './video/' + video_view_list[element].playlist[0] + '/' + 'thumbnail_360.jpg?ltik=' + params.get("ltik")
      }
      catch(err){
        thumbnail_img.src = './images/no_thumbnail.jpg'
      }
    }
    else{
      thumbnail_img.src = './video/' + video_view_list[element].vid + '/' + 'thumbnail_360.jpg?ltik=' + params.get("ltik")
    }
    thumbnail_img.alt = video_view_list[element].title
    thumbnail_img.onerror = function(){
      this.src = './images/no_thumbnail.jpg'
    }

    const thumbnail_a = clone.querySelector('.head-thumbnail-a')
    if(video_view_list[element].content_type == "playlist"){
      thumbnail_a.href = './watch?video=' + video_view_list[element].vid + '&playlist=' + video_view_list[element].vid + '&ltik=' + params.get("ltik")
    }
    else{
      thumbnail_a.href = './watch?video=' + video_view_list[element].vid + '&ltik=' + params.get("ltik")
    }

    const thumbnail_ps = clone.querySelector('.head-thumbnail-ps')
    if(video_view_list[element].content_type == "playlist"){
      thumbnail_ps.classList.add("playlist-thumbnail")
      thumbnail_ps.innerHTML = video_view_list[element].playlist.length
    }
    else{
      const _s = Math.floor(video_view_list[element].duration)
      var H = Math.floor(_s % (24 * 60 * 60) / (60 * 60))
      var M = Math.floor(_s % (24 * 60 * 60) % (60 * 60) / 60)
      var S = _s % (24 * 60 * 60) % (60 * 60) % 60
      if(H){
        thumbnail_ps.innerHTML = H + ":" + M + ":" + S
      }
      else{
        thumbnail_ps.innerHTML = M + ":" + ("0" + S).slice(-2)
      }
    }
    

    const title_div = clone.querySelector('.head-title-p')
    title_div.innerHTML = video_view_list[element].title

    const explanation_div = clone.querySelector('.head-explanation-p')
    explanation_div.innerHTML = video_view_list[element].explanation.length ? video_view_list[element].explanation : "説明なし"

    const status_div = clone.querySelector('.head-status-title')
    const status_info = clone.querySelector('.head-status-info')
    if(video_view_list[element].content_type == "playlist"){
      status_div.innerHTML = video_view_list[element].playlist.length
    }
    else{
      if(video_view_list[element].encode_error.length){
        status_div.innerHTML = "<span class='head-status-red'>●</span>エンコードエラー"
        status_div.title = "動画を削除して再度エンコードを行うか、管理者までお問い合わせください"
        status_info.innerHTML = video_view_list[element].encode_error
      }
      else if(video_view_list[element].encode_tasks.length){
        status_div.innerHTML = "<span class='head-status-yellow'>●</span>エンコード中"
        status_div.title = video_view_list[element].encode_tasks
        status_info.innerHTML = "再生可能解像度<br>" + video_view_list[element].resolution.sort(resolutionSort)
      }
      else if(video_view_list[element].resolution.length == 0 && video_view_list[element].encode_tasks.length == 0){
        status_div.innerHTML = "<span class='head-status-yellow'>●</span>処理中"
        status_div.title = "エンコード開始までしばらくお待ちください"
      }
      else{
        status_div.innerHTML = "<span class='head-status-green'>●</span>エンコード済み"
        status_div.title = video_view_list[element].resolution
        status_info.innerHTML = "再生可能解像度<br>" + video_view_list[element].resolution.sort(resolutionSort)
      }
    }

    const update_ymd = clone.querySelector('.head-update-ymd')
    const update_hms = clone.querySelector('.head-update-hms')
    const temp_update_date = new Date(video_view_list[element].updated_at)
    update_ymd.innerHTML = temp_update_date.getFullYear() + "/" + (temp_update_date.getMonth()+1) + "/" + temp_update_date.getDate()
    update_hms.innerHTML = temp_update_date

    const create_ymd = clone.querySelector('.head-create-ymd')
    const create_hms = clone.querySelector('.head-create-hms')
    const temp_create_date = new Date(video_view_list[element].created_at)
    create_ymd.innerHTML = temp_create_date.getFullYear() + "/" + (temp_create_date.getMonth()+1) + "/" + temp_create_date.getDate()
    create_hms.innerHTML = temp_create_date
    

    const edit_div = clone.querySelector('.edit-operation-btn')
    edit_div.setAttribute("id","edit-" + video_view_list[element].vid)
    if(video_view_list[element].content_type == "playlist"){
      edit_div.innerHTML = "再生リストの編集"
      edit_div.setAttribute("class","operation-btn status-ed")
      edit_div.onclick = videoEdit
    }
    else{
      if(video_view_list[element].encode_error.length){
        edit_div.setAttribute("class","operation-btn edit-lock")
      }
      else if(video_view_list[element].encode_tasks.length){
        edit_div.setAttribute("class","operation-btn status-ed")
        edit_div.onclick = videoEdit
      }
      else if(video_view_list[element].resolution.length == 0 && video_view_list[element].encode_tasks.length == 0){
        edit_div.setAttribute("class","operation-btn edit-lock")
      }
      else{
        edit_div.setAttribute("class","operation-btn status-ed")
        edit_div.onclick = videoEdit
      }
    }

    const delete_div = clone.querySelector('.delete-operation-btn')
    delete_div.setAttribute("id","delete-" + video_view_list[element].vid)
    if(video_view_list[element].content_type == "playlist"){
      delete_div.setAttribute("class","operation-btn status-now")
      delete_div.onclick = videoDelete
    }
    else{
      if(video_view_list[element].encode_error.length){
        delete_div.setAttribute("class","operation-btn status-now")
        delete_div.onclick = videoDelete
      }
      else if(video_view_list[element].encode_tasks.length){
        delete_div.setAttribute("class","operation-btn delete-lock")
      }
      else if(video_view_list[element].resolution.length == 0 && video_view_list[element].encode_tasks.length == 0){
        delete_div.setAttribute("class","operation-btn delete-lock")
      }
      else{
        delete_div.setAttribute("class","operation-btn status-now")
        delete_div.onclick = videoDelete
      }
    }

    const contributor_div = clone.querySelector('.head-contributor-p')
    try{
      contributor_div.innerHTML = video_view_list[element].contributor_name
      contributor_div.setAttribute("id","contributor-" + video_view_list[element].contributor_id)
    }catch(e){}
    
    video_list_div.appendChild(clone)
  }
  document.getElementById("all-checkbox").checked = false
  selectedList()
}

function uploadInit(){
  var params = (new URL(document.location)).searchParams

  var upload_a = document.createElement('a')
  upload_a.href = './upload?&ltik=' + params.get("ltik")

  document.getElementById("upload-btn").appendChild(upload_a)
}

function videoAddPlayList(){
  document.getElementById("playlist-overlay").classList.add("delete-overlay-on")
  document.getElementById("playlist-add-btn").onclick = addPlayList
  document.getElementById("playlist-new-btn").onclick = newPlayList
  document.getElementById("playlist-cancel-btn").onclick = addPlayListCancel

  playlistfilter = new VideoFilter({
    order : [{key: "created_at", reverse: false}],
    filtertarget : ["title","explanation"],
    filterword : ""
  })

  playlistfilter.updateOrigin = videofilter.Origin.filter(function(content){
    return content.content_type == "playlist"
  })

  play_list_draw(playlistfilter.VideoList())
}

function play_list_draw(list){
  document.getElementById("playlist-list").remove()
  var playlist_list_div = document.createElement("div")
  playlist_list_div.setAttribute("id","playlist-list")
  document.getElementById("playlist-list-area").prepend(playlist_list_div)


  const playlist_content = document.querySelector('#template-playlist').content

  for (const element in list) {
    const clone = document.importNode(playlist_content, true)
    const check_div = clone.querySelector('.list-checkbox')
    check_div.setAttribute("id","playlist-" + list[element].vid)
    check_div.value = list[element].title
    check_div.title = list[element].explanation
    check_div.playlist = list[element].playlist

    const label_div = clone.querySelector('.checkbox-label')
    label_div.setAttribute("for","playlist-" + list[element].vid)
    label_div.innerHTML = list[element].title
    label_div.title = list[element].explanation
    playlist_list_div.appendChild(clone)
  }
  
}

function addPlayList(){
  const add_play_list = document.getElementsByName("playlist-checkbox")
  const add_play_list_video = selectedList()

  const params = (new URL(document.location)).searchParams

  add_play_list.forEach(function(target){
    if(target.checked){
      var xhr = new XMLHttpRequest()
      var send_json = {
        "title": target.value,
        "explanation": target.title,
        "playlist" : target.playlist
      }

      var _id = target.id.split("-")
      if( _id[1] == "new" ){
        xhr.open('post', "./createplaylist?ltik=" + params.get("ltik"), true)
        send_json["playlist"] = add_play_list_video
      }
      else{
        xhr.open('post', "./updateplaylist?ltik=" + params.get("ltik"), true)
        send_json["playlist"] = [...new Set(send_json["playlist"].concat(add_play_list_video))]
        send_json["vid"] = _id[1]
      }

      xhr.onload = async function () {
        if(xhr.status == 200){
          var update_list = JSON.parse(xhr.response)

          if(video_dict[update_list.vid]){
            var temp_meta = JSON.parse(video_dict[update_list.vid].meta_data)
            temp_meta.playlist = update_list.playlist
            video_dict[update_list.vid].meta_data = JSON.stringify(temp_meta)
            video_dict[update_list.vid].updated_at = new Date()
          }
          else{
            video_dict[update_list.vid] = {}
            video_dict[update_list.vid].created_at = new Date()
            video_dict[update_list.vid].updated_at = new Date()
            video_dict[update_list.vid].meta_data = JSON.stringify({
              "content_type": "playlist",
              "playlist": send_json.playlist,
              "contributor_name": document.getElementById("user-name").innerText,
              "contributor_id": ""
            })
            video_dict[update_list.vid].encode_error = []
            video_dict[update_list.vid].encode_tasks = []
            video_dict[update_list.vid].resolution = []
          }

          video_dict[update_list.vid].title =  send_json.title
          video_dict[update_list.vid].explanation = send_json.explanation
          

          videofilter.updateOrigin = await toVideoList()

        }
      }

      xhr.setRequestHeader('Content-Type', 'application/json')
      xhr.send(JSON.stringify(send_json))
    }
  })

  addPlayListCancel()
}

function newPlayList(){
  document.getElementById("playlist-list-area").classList.add("playlist-new-off")
  document.getElementById("playlist-new-area").classList.remove("playlist-new-off")
  document.getElementById("playlist-new-btn").classList.add("playlist-new-off")
  document.getElementById("playlist-add-btn").innerHTML = "作成"
  document.getElementById("playlist-add-btn").onclick = newCreatePlayList
  document.getElementById("playlist-cancel-btn").onclick = newPlayListCancel

  document.getElementById("upload-title").value = ""
  document.getElementById("upload-explanation").value = ""

  document.getElementById("upload-title").addEventListener('input', title_limit_change)
  document.getElementById("upload-explanation").addEventListener('input', exp_limit_change)
  title_limit_change()
  exp_limit_change()
}

function newCreatePlayList(){
  if(!document.getElementById("upload-title").value.length){
    document.getElementById("upload-title").parentNode.parentNode.classList.add("required_input")
    document.getElementById("title-non-err").innerHTML = "タイトルを入力してください"
  }
  else{
    document.getElementById("upload-title").parentNode.parentNode.classList.remove("required_input")
    document.getElementById("title-non-err").innerHTML = ""
    var temp_date = new Date()
    var temp_origin = playlistfilter.Origin
    temp_origin.push({
      "content_type": "playlist",
      "created_at": temp_date,
      "title": document.getElementById("upload-title").value,
      "explanation": document.getElementById("upload-explanation").value,
      "vid": "new-" + temp_date.getTime(),
      "playlist": []
    })
    playlistfilter.updateOrigin = temp_origin

    play_list_draw(playlistfilter.VideoList())
    newPlayListCancel()
  }
}

function newPlayListCancel(){
  document.getElementById("playlist-list-area").classList.remove("playlist-new-off")
  document.getElementById("playlist-new-area").classList.add("playlist-new-off")
  document.getElementById("playlist-new-btn").classList.remove("playlist-new-off")
  document.getElementById("playlist-add-btn").innerHTML = "追加"
  document.getElementById("playlist-add-btn").onclick = addPlayList
  document.getElementById("playlist-cancel-btn").onclick = addPlayListCancel
}

function addPlayListCancel(){
  document.getElementById("playlist-overlay").classList.remove("delete-overlay-on")
  selectVid = []
}

function title_limit_change(){
  if(document.getElementById("upload-title").value.length > 40){
      document.getElementById("upload-title").value = document.getElementById("upload-title").value.slice(0,40)
  }
  document.getElementById("title-input-limit").innerHTML = document.getElementById("upload-title").value.length
}
function exp_limit_change(){
  if(document.getElementById("upload-explanation").value.length > 200){
      document.getElementById("upload-explanation").value = document.getElementById("upload-explanation").value.slice(0,200)
  }
  document.getElementById("exp-input-limit").innerHTML = document.getElementById("upload-explanation").value.length
}


function videoDelete(e){
  var e = e || window.event
  var elem = e.target || e.srcElement
  const selected_category = location.hash == "#listCategory" ? "playlist" : "video" 
  const selected_category_name = location.hash == "#listCategory" ? "プレイリスト" : "動画" 

  if(elem.id != "selected-delete"){
    var vid = elem.id.split('-')[1]
    selectVid.push(vid)
  }
  else{
    selectVid = selectedList()
    var delete_list = deleteList(selectVid)
    var vid = selectVid[0]
  }

  var params = (new URL(document.location)).searchParams

  document.getElementById("delete-overlay").classList.add("delete-overlay-on")
  if(selected_category == "playlist"){
    document.getElementById("delete-thumbnail").src = document.getElementById("video-" + vid).getElementsByTagName("img")[0].src
  }
  else{
    document.getElementById("delete-thumbnail").src = './video/' + vid + '/' + 'thumbnail_360.jpg?ltik=' + params.get("ltik")
  }
  document.getElementById("delete-thumbnail").onerror = function(){
    this.src='./images/no_thumbnail.jpg'
  }

  document.getElementById("delete-area-title").innerHTML =　"この" + selected_category_name + "を削除しますか"
  if(elem.id != "selected-delete"){
    document.getElementById("delete-title").innerHTML = video_dict[vid].title
  }
  else{
    document.getElementById("delete-title").innerHTML = selectVid.length + " 件の" + selected_category_name
    if(selectVid.length != delete_list.length){
      document.getElementById("delete-warning").innerHTML = (selectVid.length - delete_list.length) + " 件の" + selected_category_name + "は削除できません"
      selectVid = delete_list
    }
  }

  document.getElementById("delete-cancel-btn").onclick = deleteCancel
  document.getElementById("delete-run-btn").onclick = deleteRun
}

function deleteCancel(){
  document.getElementById("delete-overlay").classList.remove("delete-overlay-on")
  selectVid = []
}

function deleteRun(){
  var params = (new URL(document.location)).searchParams
  selectVid.forEach(function(delete_vid){
    var send_json = {"vid":delete_vid}
    var xhr = new XMLHttpRequest()
    xhr.open('post', "./videodelete?ltik=" + params.get("ltik"), true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify(send_json))

    xhr.onload = async function () {
      if(xhr.status == 200){
        document.getElementById("video-" + delete_vid).remove()
        delete video_dict[delete_vid]

        videofilter.updateOrigin = await toVideoList()
        video_list_draw(videofilter.VideoList())
      }
    }
  })
  document.getElementById("delete-overlay").classList.toggle("delete-overlay-on")
}

function deleteList(list){
  var check_list = {}
  videofilter.VideoList().forEach(function(target){
    check_list[target.vid] = target
  })
  var result = []
  list.forEach(function(target){
    if(check_list[target].status == 3 || check_list[target].status == 0 ){
      result.push(target)
    }
  })
  return result
}

function videoEdit(e){
  var e = e || window.event
  var elem = e.target || e.srcElement
  var vid = elem.id.split('-')[1]
  var params = (new URL(document.location)).searchParams

  window.location.href = "./edit?vid=" + vid + "&ltik=" + params.get("ltik")
}


function getVideoList(){
    var request = new XMLHttpRequest()
    var params = (new URL(document.location)).searchParams
    request.open('POST', "./videolist?ltik=" + params.get("ltik"), true)
  
    request.onload = async function () {
      video_dict = JSON.parse(request.response)
      
      videofilter.updateOrigin = await toVideoList()
      video_list_draw(videofilter.VideoList())
      document.getElementById("filter-word").addEventListener('input', redraw_video_list)
    }
    request.send()
}

function toVideoList(){
  var video_array = Object.keys(video_dict).map(function(k){
    var t_video = Object.assign( { "vid": k }, video_dict[k] )
    if(video_dict[k].encode_error.length){
      t_video.status = 0
    }
    else if(video_dict[k].encode_tasks.length){
      t_video.status = 1
    }
    else if(video_dict[k].resolution.length == 0 && video_dict[k].encode_tasks.length == 0){
      t_video.status = 2
    }
    else{
      t_video.status = 3
    }
    try{
      const meta_data_obj = JSON.parse(video_dict[k].meta_data)
      t_video.contributor_name = meta_data_obj.contributor_name
      t_video.contributor_id = meta_data_obj.contributor_id
      t_video.content_type = meta_data_obj.content_type || "video"
      if(t_video.content_type == "playlist"){
        t_video.playlist = meta_data_obj.playlist || []
        t_video.status = 3
      }
      t_video.duration = meta_data_obj.duration || 0
    }catch(e){
      t_video.contributor_name = ""
      t_video.contributor_id = ""
      t_video.content_type = "video"
      t_video.duration = 0
    }
    
    return t_video
  })

  return video_array
}


function classNameInit(InitData){
  document.getElementById("class-name").innerHTML = InitData.context.label + "のコンテンツ"
}

function headSort(e){
  var e = e || window.event
  var elem = e.target || e.srcElement
  var sort_id = elem.parentNode.id
  var reverse_mode = false
  if (elem.parentNode.classList.contains('asc')) {
      elem.parentNode.classList.replace('asc', 'desc')
      reverse_mode = false
  } else if (elem.parentNode.classList.contains('desc')) {
      elem.parentNode.classList.replace('desc', 'asc')
      reverse_mode = true
  } else {
      elem.parentNode.classList.add('asc')
      reverse_mode = true
  }

  for(var remove_id of ["sort-video-btn","sort-status-btn","sort-update-btn","sort-create-btn","sort-contributor-btn"]){
    if(remove_id != sort_id){
      document.getElementById(remove_id).classList.remove('asc', 'desc')
    }
  }

  if(sort_id == "sort-video-btn"){
    videofilter.order = [
      {key: "title", reverse: reverse_mode},
      {key: "created_at", reverse: false}
    ]
  }
  else if(sort_id == "sort-status-btn"){
    videofilter.order = [
      {key: "status", reverse: reverse_mode},
      {key: "created_at", reverse: false}
    ]
  }
  else if(sort_id == "sort-update-btn"){
    videofilter.order = [
      {key: "updated_at", reverse: reverse_mode},
      {key: "created_at", reverse: false}
    ]
  }
  else if(sort_id == "sort-create-btn"){
    videofilter.order = [
      {key: "created_at", reverse: reverse_mode}
    ]
  }
  else if(sort_id == "sort-contributor-btn"){
    videofilter.order = [
      {key: "contributor_name", reverse: reverse_mode},
      {key: "created_at", reverse: false}
    ]
  }
  
  redraw_video_list()
}

function headSortInit(){
  document.querySelectorAll(".sort-head-btn").forEach(function(target) {
    target.addEventListener("click", headSort, false)
  })
}

function categoryChange(){
  if(location.hash == "#listCategory"){
    document.getElementById("category-select-bar").classList.remove("category-select-video")
    document.getElementById("category-select-bar").classList.add("category-select-list")
    document.getElementById("sort-video-btn").firstElementChild.innerHTML = "再生リスト"
    document.getElementById("sort-status-btn").firstElementChild.innerHTML = "動画数"
    document.getElementById("selected-add-list").classList.add("category-display-none")
  }
  else{
    document.getElementById("category-select-bar").classList.remove("category-select-list")
    document.getElementById("category-select-bar").classList.add("category-select-video")
    document.getElementById("sort-video-btn").firstElementChild.innerHTML = "動画"
    document.getElementById("sort-status-btn").firstElementChild.innerHTML = "状態"
    document.getElementById("selected-add-list").classList.remove("category-display-none")
  }
}

function categoryInit(){

  window.addEventListener("hashchange", function(){
    categoryChange()
    video_list_draw(videofilter.VideoList())
  }, false)

  categoryChange()
}

function checkboxInit(){
  document.getElementById("all-checkbox").addEventListener("change", function(){
    var all_checked = document.getElementById("all-checkbox").checked
    document.getElementsByName("video-checkbox").forEach(function(target){
        target.checked = all_checked
    })
    selectedList()
  }, false)
}

function selectedList(){
  var selected_contents = []
  document.getElementsByName("video-checkbox").forEach(function(target){
    if(target.checked){
      selected_contents.push(target.id.split("-")[1])
    }
  })

  if(selected_contents.length){
    document.getElementsByClassName("checkbox-selected")[0].classList.remove("checkbox-selected-off")
    document.getElementsByClassName("selected-length")[0].innerHTML = selected_contents.length + " 件選択しました"
  }
  else{
    document.getElementsByClassName("checkbox-selected")[0].classList.add("checkbox-selected-off")
    document.getElementsByClassName("selected-length")[0].innerHTML = "0 件選択しました"
  }
  return selected_contents
}

window.addEventListener("load", function() {
    categoryInit()
    checkboxInit()
    getLtiInfoResponse(classNameInit)
    getVideoList()
    uploadInit()
    headSortInit()
})

