let contents_list

function contentsListReDraw(){
    contentsfilter.filterword = document.getElementById("filter-word").value
    contentsListDraw(contentsfilter.VideoList())
}

function contentsListDraw(list){
    document.getElementById("contents-list").remove()
    let contents_list_div = document.createElement("div")
    contents_list_div.setAttribute("id","contents-list")
    document.getElementById("contents-list-area").prepend(contents_list_div)


    const _content = document.querySelector('#template-contents').content

    for (const element in list) {
        const clone = document.importNode(_content, true)

        const title_div = clone.querySelector('.content_title')
        title_div.innerHTML = list[element].title

        const a_div = clone.querySelector('.content_a')
        if(!params.get("service")){
            a_div.href = "./allvideolist?service=" + list[element].title + "&ltik=" + params.get("ltik")
        }
        else{
            a_div.href = "./allvideolist?service=" + params.get("service") + "&class=" + list[element].title + "&ltik=" + params.get("ltik")
        }
        
        contents_list_div.appendChild(clone)
    }
}

function toContentsList(){
    let contents_array = contents_list.map(function(k){
        return {"title":k}
    })
    return contents_array
}

function getContentsList(){
    const request = new XMLHttpRequest()
    if(!params.get("service")){
        request.open('GET', "./servicelist?ltik=" + params.get("ltik"), true)
    }
    else{
        request.open('GET', "./classlist?service=" + params.get("service") + "&ltik=" + params.get("ltik"), true)
    }
    
    request.onload = async function () {
        contents_list = JSON.parse(request.response)
        contentsfilter.updateOrigin = await toContentsList()
        contentsListDraw(contentsfilter.VideoList())
        document.getElementById("filter-word").addEventListener('input', contentsListReDraw)
    }
    request.send()
}

function contentsTitleInit(){
    if(params.get("service")){
        const contentsNameElement = document.getElementById("contents-name")
        contentsNameElement.innerHTML = ""
        const service_a = document.createElement('a')
        service_a.innerHTML = "サービス名"
        service_a.href = './allvideolist?ltik=' + params.get("ltik")
    
        const split_p1 = document.createElement('p')
        split_p1.innerHTML = " > " + params.get("service")
    
        contentsNameElement.appendChild(service_a)
        contentsNameElement.appendChild(split_p1)

        contentsNameElement.title = "サービス名 > " + params.get("service")
    }
}

window.addEventListener("load", function() {
    contentsfilter = new VideoFilter({
        order : [{key: "title", reverse: false}],
        filtertarget : ["title"],
        filterword : ""
    })
    getContentsList()
    contentsTitleInit()
})