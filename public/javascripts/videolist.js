var video_dict = {}

function resolutionSort(a, b) {
  return parseInt(a) - parseInt(b)
}

function redraw_video_list(){
  videofilter.filterword = document.getElementById("filter-word").value
  video_list_draw(videofilter.VideoList())
}

function video_list_draw(video_view_list){
  console.log(video_view_list)
  var params = (new URL(document.location)).searchParams
  document.getElementById("videolist").remove()
  var video_list_div = document.createElement("div")
  video_list_div.setAttribute("id","videolist")
  document.getElementById("videolist-area").prepend(video_list_div)

  const video_content = document.querySelector('#template-video').content

  for (const element in video_view_list) {
    const clone = document.importNode(video_content, true)
    
    const video_div = clone.querySelector('.video_div')
    video_div.setAttribute("id","video-" + video_view_list[element].vid)

    const thumbnail_img = clone.querySelector('.head-thumbnail-img')
    thumbnail_img.src = './video/' + video_view_list[element].vid + '/' + 'thumbnail_360.jpg?ltik=' + params.get("ltik")
    thumbnail_img.alt = video_view_list[element].title
    thumbnail_img.onerror = function(){
      this.src='./images/no_thumbnail.jpg'
    }

    const thumbnail_a = clone.querySelector('.head-thumbnail-a')
    thumbnail_a.href = './watch?video=' + video_view_list[element].vid + '&ltik=' + params.get("ltik")

    const title_div = clone.querySelector('.head-title-p')
    title_div.innerHTML = video_view_list[element].title

    const explanation_div = clone.querySelector('.head-explanation-p')
    explanation_div.innerHTML = video_view_list[element].explanation.length ? video_view_list[element].explanation : "説明なし"

    const status_div = clone.querySelector('.head-status-title')
    const status_info = clone.querySelector('.head-status-info')
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

    const delete_div = clone.querySelector('.delete-operation-btn')
    delete_div.setAttribute("id","delete-" + video_view_list[element].vid)
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

    const contributor_div = clone.querySelector('.head-contributor-p')
    try{
      contributor_div.innerHTML = video_view_list[element].contributor_name
      contributor_div.setAttribute("id","contributor-" + video_view_list[element].contributor_id)
    }catch(e){}
    

    video_list_div.appendChild(clone)

  }
}

function uploadInit(){
  var params = (new URL(document.location)).searchParams

  var upload_a = document.createElement('a')
  upload_a.href = './upload?&ltik=' + params.get("ltik")

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
  document.getElementById("delete-thumbnail").src = './video/' + vid + '/' + 'thumbnail_360.jpg?ltik=' + params.get("ltik")
  document.getElementById("delete-thumbnail").onerror = function(){
    this.src='./images/no_thumbnail.jpg'
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
    xhr.open('post', "./videodelete?ltik=" + params.get("ltik"), true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify(send_json))

    xhr.onload = function () {
      if(xhr.status == 200){
        document.getElementById("delete-overlay").classList.toggle("delete-overlay-on")
        document.getElementById("video-" + selectVid).remove()

        delete video_dict[selectVid]
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
          }catch(e){
            t_video.contributor_name = ""
            t_video.contributor_id = ""
          }
          
          return t_video
        })
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

  window.location.href = "./edit?vid=" + vid + "&ltik=" + params.get("ltik")
}


function getVideoList(){
    var request = new XMLHttpRequest()
    var params = (new URL(document.location)).searchParams
    request.open('POST', "./videolist?ltik=" + params.get("ltik"), true)
  
    request.onload = function () {
      var listdata = JSON.parse(request.response)
      video_dict = listdata
      var video_array = Object.keys(listdata).map(function(k){
        var t_video = Object.assign( { "vid": k }, listdata[k] )
        if(listdata[k].encode_error.length){
          t_video.status = 0
        }
        else if(listdata[k].encode_tasks.length){
          t_video.status = 1
        }
        else if(listdata[k].resolution.length == 0 && listdata[k].encode_tasks.length == 0){
          t_video.status = 2
        }
        else{
          t_video.status = 3
        }
        try{
          const meta_data_obj = JSON.parse(listdata[k].meta_data)
          t_video.contributor_name = meta_data_obj.contributor_name
          t_video.contributor_id = meta_data_obj.contributor_id
        }catch(e){
          t_video.contributor_name = ""
          t_video.contributor_id = ""
        }
        
        return t_video
      })
      videofilter.updateOrigin = video_array
      video_list_draw(videofilter.VideoList())
      document.getElementById("filter-word").addEventListener('input', redraw_video_list)
    }
    request.send()
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

window.addEventListener("load", function() {
    getLtiInfoResponse(classNameInit)
    getVideoList()
    uploadInit()
    headSortInit()
})

