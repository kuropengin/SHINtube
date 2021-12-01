
function systemDisplay(system){
    if(system.app_status.status){
        document.getElementById("info-app-name").innerHTML = system.app_status.name
        document.getElementById("info-app-version").innerHTML = system.app_status.version
    }
    else{
        document.getElementById("info-app-name").innerHTML = system.app_status.msg
    }

    if(system.backapi_status.status){
        document.getElementById("info-backapi-status").innerHTML = system.backapi_status.msg
    }
    else{
        document.getElementById("info-backapi-status").innerHTML = system.backapi_status.msg
    }
    if(system.backfile_status.status){
        document.getElementById("info-backfile-status").innerHTML = system.backfile_status.msg
    }
    else{
        document.getElementById("info-backfile-status").innerHTML = system.backfile_status.msg
    }

    if(system.grade_status.status){
        document.getElementById("info-grade-status").innerHTML = system.grade_status.msg
    }
    else{
        document.getElementById("info-grade-status").innerHTML = system.grade_status.msg
    }


    if(system.deeplink_status.status){
        document.getElementById("info-deeplink-status").innerHTML = system.deeplink_status.msg
        document.getElementById("info-deeplink-contents").innerHTML = system.deeplink_status.vid
    }
    else{
        document.getElementById("info-deeplink-status").innerHTML = system.deeplink_status.msg
    }

    document.getElementById("info-lms-url").innerHTML = system.lms_status.lmsUri
    document.getElementById("info-lms-year").innerHTML = system.lms_status.lmsYear
    document.getElementById("info-lms-platformId").innerHTML = system.lms_status.platformId
    document.getElementById("info-lms-classname").innerHTML = system.lms_status.className.title
    document.getElementById("info-lms-classid").innerHTML = system.lms_status.classCode.course_section_sourcedid
}

function systemCheck(){
    var request = new XMLHttpRequest()
    request.open('GET', "./system-check?ltik=" + params.get("ltik"), true)
  
    request.onload = function () {
        const systemdata = JSON.parse(request.response)
        systemDisplay(systemdata)
    }
    request.send()
}


window.addEventListener("load", function() {
    systemCheck()
})