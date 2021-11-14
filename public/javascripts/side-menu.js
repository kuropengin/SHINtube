function subMenuInit(){
    var params = (new URL(document.location)).searchParams

    const now_path = location.pathname.split("/").slice(-1)[0]
    if(now_path == "videolist"){
        document.getElementById("sub-contents-btn").classList.add("side-menu-select")
    }
    else if(now_path == "upload"){
        document.getElementById("sub-upload-btn").classList.add("side-menu-select")
    }
    else if(now_path == "system"){
        document.getElementById("sub-system-btn").classList.add("side-menu-select")
    }
  
    var sub_contents_a = document.createElement('a')
    sub_contents_a.href = './videolist?&ltik=' + params.get("ltik")
    sub_contents_a.title = "全てのコンテンツ"

    var sub_upload_a = document.createElement('a')
    sub_upload_a.href = './upload?&ltik=' + params.get("ltik")
    sub_upload_a.title = "アップロード"

    var sub_system_a = document.createElement('a')
    sub_system_a.href = './system?&ltik=' + params.get("ltik")
    sub_system_a.title = "システム"
    
    document.getElementById("sub-contents-btn").appendChild(sub_contents_a)
    document.getElementById("sub-upload-btn").appendChild(sub_upload_a)
    document.getElementById("sub-system-btn").appendChild(sub_system_a)
}
  

window.addEventListener("load", function() {
    subMenuInit()
})