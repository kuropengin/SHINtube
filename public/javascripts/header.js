var ResponseData = false

function getLtiInfoResponse(callback) {
    var request = new XMLHttpRequest()
    request.open('GET', "./info?ltik=" + params.get("ltik"), true)

    request.onload = function () {
        if(request.status == 200){
            ResponseData = JSON.parse(request.response)
        }
        callback(ResponseData)
    }
    request.send()
}

function butotnClick() {
    document.getElementById("munu-btn").classList.toggle("active")
    document.getElementById("menu-area").classList.toggle("open")
    document.getElementById("menu-overlay").classList.toggle("on-overlay")
}

function hederInit(InitData) {
    if(InitData){
        document.getElementById("user-name").innerHTML = InitData.name
        document.getElementById("class-title").innerHTML = InitData.context.label
    }
    else{
        document.getElementById("user-name").innerHTML = "LTI認証エラー"
        document.getElementById("class-title").innerHTML = "LTI認証エラー"
    }
    document.getElementById("root-page").addEventListener('click', function(){
        //window.location.href = "./?ltik=" + params.get("ltik")
    })
    document.getElementById("about-page").addEventListener('click', function(){
        window.location.href = "./about?ltik=" + params.get("ltik")
    })
    document.getElementById("return-page").addEventListener('click', function(){
        window.location.href = "./return?ltik=" + params.get("ltik")
    })
    document.getElementById("logout-page").addEventListener('click', function(){
        window.location.href = "./logout?ltik=" + params.get("ltik")
    })
}

window.addEventListener("load", function() {
    getLtiInfoResponse(hederInit)
    document.getElementById("munu-btn").addEventListener('click', butotnClick)
    document.getElementById("menu-overlay").addEventListener('click', butotnClick)
    document.getElementById("toggle").addEventListener('click', ThemeToggle)

    document.getElementById("memo-delete").addEventListener('click', function(){
        var _volume = localStorage.getItem("volume") || 1
        var _theme = localStorage.getItem("theme-mode") || false

        localStorage.clear()

        localStorage.setItem('volume', _volume)
        if(_theme){
            localStorage.setItem('theme-mode', _theme)
        }
    })
    document.getElementById("config-delete").addEventListener('click', function(){
        localStorage.removeItem("theme-mode")
        localStorage.removeItem("volume")
    })
    
})



