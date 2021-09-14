
function getTOS() {
    var request = new XMLHttpRequest()
    request.open('GET', "/TOS", true)

    request.onload = function () {
        if(request.status == 200){
            document.getElementById("contents").innerHTML = marked(request.response,{breaks: true})
        }
    }
    request.send()
}

window.addEventListener("load", function() {
    getTOS()
})