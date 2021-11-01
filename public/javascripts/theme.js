const os_theme_mode = window.matchMedia('(prefers-color-scheme: dark)').matches

function ThemeModeInit() {
    var local_theme = localStorage.getItem("theme-mode") || false
    var toggle_btn = document.getElementById("toggle") || {}

    if(local_theme == "dark"){
        toggle_btn.checked = false
        ThemeModeChange("dark-theme")
    }
    else if(local_theme == "light"){
        toggle_btn.checked = true
        ThemeModeChange("light-theme")
    }
    else if(os_theme_mode){
        toggle_btn.checked = false
        localStorage.setItem('theme-mode', "dark")
        ThemeModeChange("dark-theme")
    }
    else{
        toggle_btn.checked = true
        localStorage.setItem('theme-mode', "light")
        ThemeModeChange("light-theme")
    }
    
}


function ThemeModeChange(mode) {
    var elements = ["logo","header","munu-btn","munu","overlay","download-btn","download-list","filter-word","delete-area","video-input","upload-btn","drag-area-block"]
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

    let root = document.documentElement
    if(mode == "light-theme"){
        document.body.classList.remove("dark-theme-body")
        document.body.classList.add("light-theme-body")

        root.style.setProperty('--default_back_color',"#FFF")
        root.style.setProperty('--default_color',"#181818")
        root.style.setProperty('--hover_back_color',"#f3f3f3")
        root.style.setProperty('--default_icon_filter',"none")
        root.style.setProperty('--menu_back_color',"rgba(255, 255, 255, 0.95)")
        root.style.setProperty('--deeplink_select_back_color',"#f3f3f3")
        root.style.setProperty('--memo_back_color',"#fbfbfb")
        root.style.setProperty('--overlay_back_color',"rgba(68, 68, 68, 0.2)")
    }
    else{
        document.body.classList.add("dark-theme-body")
        document.body.classList.remove("light-theme-body")

        root.style.setProperty('--default_back_color',"#181818")
        root.style.setProperty('--default_color',"#FFF")
        root.style.setProperty('--hover_back_color',"#2c2c2c")
        root.style.setProperty('--default_icon_filter',"invert(88%) sepia(61%) saturate(0%) hue-rotate(229deg) brightness(107%) contrast(101%)")
        root.style.setProperty('--menu_back_color',"rgba(32, 32, 32, 0.95)")
        root.style.setProperty('--deeplink_select_back_color',"#2c2c2c")
        root.style.setProperty('--memo_back_color',"#313131")
        root.style.setProperty('--overlay_back_color',"rgba(0, 0, 0, 0.5)")
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
    ThemeModeInit()
})
