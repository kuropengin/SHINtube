const os_theme_mode = window.matchMedia('(prefers-color-scheme: dark)').matches

var ResponseData = false

function getLtiInfoResponse(callback) {
    var request = new XMLHttpRequest()
    var params = (new URL(document.location)).searchParams
    request.open('GET', "/info?ltik=" + params.get("ltik"), true)

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
    var params = (new URL(document.location)).searchParams
    if(InitData){
        document.getElementById("user-name").innerHTML = InitData.name
        document.getElementById("class-title").innerHTML = InitData.context.label
    }
    else{
        document.getElementById("user-name").innerHTML = "LTI認証エラー"
        document.getElementById("class-title").innerHTML = "LTI認証エラー"
    }
    document.getElementById("about-page").addEventListener('click', function(){
        window.location.href = ""
    })
    document.getElementById("return-page").addEventListener('click', function(){
        window.location.href = "/return?ltik=" + params.get("ltik")
    })
    document.getElementById("logout-page").addEventListener('click', function(){
        window.location.href = "/logout?ltik=" + params.get("ltik")
    })
}


function ThemeModeInit() {
    var local_theme = localStorage.getItem("theme-mode") || false

    if(local_theme == "dark"){
        document.getElementById("toggle").checked = false
        ThemeModeChange("dark-theme")
    }
    else if(local_theme == "light"){
        document.getElementById("toggle").checked = true
        ThemeModeChange("light-theme")
    }
    else if(os_theme_mode){
        document.getElementById("toggle").checked = false
        localStorage.setItem('theme-mode', "dark")
        ThemeModeChange("dark-theme")
    }
    else{
        document.getElementById("toggle").checked = true
        localStorage.setItem('theme-mode', "light")
        ThemeModeChange("light-theme")
    }
    
}


function ThemeModeChange(mode) {
    var elements = ["logo","header","munu-btn","munu","munu-icon","overlay","memo","download-btn","download-list","filter-word","delete-area","video-input"]
    for(var element of elements){
        var change_theme = document.getElementsByClassName("theme-" + element)
        for(var target_theme of change_theme){
            if(mode == "light-theme"){
                target_theme.classList.remove("dark-theme-" + element)
                target_theme.classList.add("light-theme-" + element)
            }
            else{
                target_theme.classList.add("dark-theme-" + element)
                target_theme.classList.remove("light-theme-" + element)
            }
        }
    }

    if(mode == "light-theme"){
        document.body.classList.remove("dark-theme-body")
        document.body.classList.add("light-theme-body")
    }
    else{
        document.body.classList.add("dark-theme-body")
        document.body.classList.remove("light-theme-body")
    }
}


function ThemeToggle(){
    if(document.getElementById("toggle").checked){
        localStorage.setItem('theme-mode', "light")
        ThemeModeChange("light-theme")
    }
    else{
        localStorage.setItem('theme-mode', "dark")
        ThemeModeChange("dark-theme")
    }
}


window.addEventListener("load", function() {
    getLtiInfoResponse(hederInit)
    ThemeModeInit()
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



