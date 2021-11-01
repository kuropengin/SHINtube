function getVideoList(){
    var request = new XMLHttpRequest()
    var params = (new URL(document.location)).searchParams
    request.open('POST', "/videolist?ltik=" + params.get("ltik"), true)

    request.onload = function () {
        document.getElementById("deeplinkPOST").action += "?ltik=" + params.get('ltik')

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
        create_list(videofilter.VideoList())
        document.getElementById("filter-word").addEventListener('input', redraw_video_list)
    }
    request.send()
}

function redraw_video_list(){
    videofilter.filterword = document.getElementById("filter-word").value
    create_list(videofilter.VideoList())
}

function create_list(listdata){
    var params = (new URL(document.location)).searchParams

    document.getElementById("list-area").remove()
    var list_area = document.createElement("div")
    list_area.setAttribute("id","list-area")
    document.getElementById("deeplinkPOST").prepend(list_area)

    const video_content = document.querySelector('#template-video').content

    for (const element in listdata) {
        const clone = document.importNode(video_content, true)
    
        const _radio = clone.querySelector('.input-select')
        _radio.setAttribute("id","video-" + listdata[element].vid)
        _radio.setAttribute("value", listdata[element].vid)
        _radio.onchange = selected_video

        const _label = clone.querySelector('.label')
        _label.setAttribute("for","video-" + listdata[element].vid)

        const _thumbnail = clone.querySelector('.img-thumbnail')
        _thumbnail.src = '/video/' + listdata[element].vid + '/' + 'thumbnail_360.jpg?ltik=' + params.get("ltik")
        _thumbnail.onerror = function(){
            this.src='/images/no_thumbnail.jpg'
        }

        const _title = clone.querySelector('.video-title')
        _title.innerHTML = listdata[element].title
        _title.setAttribute("id","title-" + listdata[element].vid)

        const _explanation = clone.querySelector('.video-explanation')
        _explanation.innerHTML = listdata[element].explanation

        const _update = clone.querySelector('.video-update')
        const temp_update_date = new Date(listdata[element].updated_at)
        _update.innerHTML = "更新日 : " + temp_update_date.getFullYear() + "/" + temp_update_date.getMonth() + "/" + temp_update_date.getDate()

        const _create = clone.querySelector('.video-create')
        const temp_create_date = new Date(listdata[element].created_at)
        _create.innerHTML = "作成日 : " + temp_create_date.getFullYear() + "/" + temp_create_date.getMonth() + "/" + temp_create_date.getDate()

        const _contributor = clone.querySelector('.video-contributor')
        _contributor.innerHTML = "投稿者 : " + listdata[element].contributor_name


        list_area.appendChild(clone)
    }
    selected_video()
}

function selected_video() {
    var check_list = document.getElementsByName("select_video")
    document.getElementById("url-submit").disabled = true
    for(var i = 0; i < check_list.length; i++){
        if(check_list[i].checked) {
            document.getElementById("select_title").value = document.getElementById("title-" + check_list[i].value).innerHTML 
            document.getElementById("select_url").value = document.location.origin + "/watch?video=" + check_list[i].value + "&deeplink=true"
            document.getElementById("url-submit").disabled = false
            break
        }
    }
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

    for(var remove_id of ["sort-video-btn","sort-update-btn","sort-create-btn","sort-contributor-btn"]){
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
    headSortInit()
    getVideoList()
})
