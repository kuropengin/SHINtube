function subMenuInit(){
    const now_path = location.pathname.split("/").slice(-1)[0]
    if(now_path == "allvideolist"){
        document.getElementById("sub-admin-btn").classList.add("side-menu-select")
    }
    else if(now_path == "videolist"){
        document.getElementById("sub-contents-btn").classList.add("side-menu-select")
    }
    else if(now_path == "upload"){
        document.getElementById("sub-upload-btn").classList.add("side-menu-select")
    }
    else if(now_path == "system"){
        document.getElementById("sub-system-btn").classList.add("side-menu-select")
    }

    const admin_a = document.getElementById("sub-admin-btn")
    if(admin_a){
        const sub_admin_a = document.createElement('a')
        sub_admin_a.href = './allvideolist?&ltik=' + params.get("ltik")
        sub_admin_a.title = "管理画面"
        admin_a.appendChild(sub_admin_a)
    }

    const contents_a = document.getElementById("sub-contents-btn")
    if(contents_a){
        const sub_contents_a = document.createElement('a')
        sub_contents_a.href = './videolist?&ltik=' + params.get("ltik")
        sub_contents_a.title = "全てのコンテンツ"
        contents_a.appendChild(sub_contents_a)
    }

    const upload_a = document.getElementById("sub-upload-btn")
    if(upload_a){
        const sub_upload_a = document.createElement('a')
        sub_upload_a.href = './upload?&ltik=' + params.get("ltik") + 
        (params.get("service")? "&service=" + params.get("service") : "") + (params.get("class")? "&class=" + params.get("class") : "")
        sub_upload_a.title = "アップロード"
        upload_a.appendChild(sub_upload_a)
    }

    const system_a = document.getElementById("sub-system-btn")
    if(system_a){
        const sub_system_a = document.createElement('a')
        sub_system_a.href = './system?&ltik=' + params.get("ltik")
        sub_system_a.title = "システム"
        system_a.appendChild(sub_system_a)
    }
}
  

window.addEventListener("load", function() {
    subMenuInit()
})