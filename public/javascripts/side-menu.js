function subMenuInit(){
    var params = (new URL(document.location)).searchParams

    if(location.pathname == "/videolist"){
        document.getElementById("sub-contents-btn").classList.add("side-menu-select")
    }
    else if(location.pathname == "/upload"){
        document.getElementById("sub-upload-btn").classList.add("side-menu-select")
    }
    else if(location.pathname == "/system"){
        document.getElementById("sub-system-btn").classList.add("side-menu-select")
    }
  
    var sub_contents_a = document.createElement('a')
    sub_contents_a.href = '/videolist?&ltik=' + params.get("ltik")

    var sub_upload_a = document.createElement('a')
    sub_upload_a.href = '/upload?&ltik=' + params.get("ltik")

    var sub_system_a = document.createElement('a')
    sub_system_a.href = '/system?&ltik=' + params.get("ltik")
    
    document.getElementById("sub-contents-btn").appendChild(sub_contents_a)
    document.getElementById("sub-upload-btn").appendChild(sub_upload_a)
    document.getElementById("sub-system-btn").appendChild(sub_system_a)
}
  

window.addEventListener("load", function() {
    subMenuInit()
})