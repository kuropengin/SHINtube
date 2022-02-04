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
        if(request.status == 200){
            contents_list = JSON.parse(request.response)
            contentsfilter.updateOrigin = await toContentsList()
            contentsListDraw(contentsfilter.VideoList())
            document.getElementById("filter-word").addEventListener('input', contentsListReDraw)
        }
    }
    request.send()
}

function contentsTitleInit(){
    if(params.get("service")){
        const contentsNameElement = document.getElementById("contents-name")
        contentsNameElement.innerHTML = ""
        const service_a = document.createElement('a')
        service_a.innerHTML = "サービス一覧"
        service_a.href = './allvideolist?ltik=' + params.get("ltik")
    
        const split_p1 = document.createElement('p')
        split_p1.innerHTML = " > " + params.get("service")
    
        contentsNameElement.appendChild(service_a)
        contentsNameElement.appendChild(split_p1)

        contentsNameElement.title = "サービス一覧 > " + params.get("service")
    }
}

function newServiceClassInit(){
    document.getElementById("upload-btn").addEventListener("click",newServiceClass)
    document.getElementById("new-service-class-cancel-btn").addEventListener("click",newServiceClassCancel)
    document.getElementById("new-service-class-add-btn").addEventListener("click",newServiceClassCheck)

    document.getElementById("new-service-input-limit-max").textContent = document.getElementById("new-service-input").maxLength
    document.getElementById("new-service-input").addEventListener('input', function(){
        inputLimitCheck("new-service-input","new-service-input-limit-now",40)
    })
    

    document.getElementById("new-class-input-limit-max").textContent = document.getElementById("new-class-input").maxLength
    document.getElementById("new-class-input").addEventListener('input', function(){
        inputLimitCheck("new-class-input","new-class-input-limit-now",40)
    })
}

function newServiceClass(){
    document.getElementById("new-service-class-overlay").classList.add("overlay-on")

    document.getElementById("new-service-input").value = params.get("service")? params.get("service") : ""
    document.getElementById("new-class-input").value = ""

    document.getElementById("new-service-err").textContent = ""
    document.getElementById("new-class-err").textContent = ""
    document.getElementById("new-service-class-err").textContent = ""

    inputLimitCheck("new-service-input","new-service-input-limit-now",40)
    inputLimitCheck("new-class-input","new-class-input-limit-now",40)
}

function newServiceClassCancel(){
    document.getElementById("new-service-class-overlay").classList.remove("overlay-on")
}

function newServiceClassCheck(){
    document.getElementById("new-service-err").textContent = ""
    document.getElementById("new-class-err").textContent = ""
    let checkFlag = true
    if(!document.getElementById("new-service-input").value.length){
        document.getElementById("new-service-err").textContent = "入力されていません"
        checkFlag = false
    }
    if(params.get("service") && !document.getElementById("new-class-input").value.length){
        document.getElementById("new-class-err").textContent = "入力されていません"
        checkFlag = false
    }

    if(document.getElementById("new-service-input").value.indexOf("/") !== -1){
        document.getElementById("new-service-err").textContent = '使用できない文字が含まれています："/"'
        checkFlag = false
    }
    if(document.getElementById("new-class-input").value.indexOf("/") !== -1){
        document.getElementById("new-class-err").textContent = '使用できない文字が含まれています："/"'
        checkFlag = false
    }


    if(checkFlag){
        newServiceClassAdd(document.getElementById("new-service-input").value, document.getElementById("new-class-input").value)
    }
}

function newServiceClassAdd(sid, cid){
    const request = new XMLHttpRequest()

    request.open('POST', './newserviceclass?service=' + encodeURI(sid) + ((cid.length)?'&class=' + encodeURI(cid) : '') + "&ltik=" + params.get("ltik"), true)
 
    request.onload = async function () {
        if(request.status == 200 ){
            const resJson = JSON.parse(request.response)
            if(resJson.Result == "OK"){
                if(!params.get("service")){
                    if(contents_list.indexOf(sid) == -1){
                        contents_list.push(sid)
                    }
                }
                else{
                    if(contents_list.indexOf(cid) == -1){
                        contents_list.push(cid)
                    }
                }
                contentsfilter.updateOrigin = await toContentsList()
                contentsListDraw(contentsfilter.VideoList())
                newServiceClassCancel()
            }
            else{
                document.getElementById("new-service-class-err").textContent = "作成に失敗しました：" +  resJson.Detail
            }
        }
        else{
            document.getElementById("new-service-class-err").textContent = "作成に失敗しました"
        }
    }
    request.send()
}

function inputLimitCheck(target, result, maxlimit){
    if(document.getElementById(target).value.length > maxlimit){
        document.getElementById(target).value = document.getElementById(target).value.slice(0,maxlimit)
    }
    document.getElementById(result).textContent = document.getElementById(target).value.length
}

function inputFocus(target){
    document.getElementById(target).focus()
}

window.addEventListener("load", function() {
    contentsfilter = new VideoFilter({
        order : [{key: "title", reverse: false}],
        filtertarget : ["title"],
        filterword : ""
    })
    getContentsList()
    contentsTitleInit()
    newServiceClassInit()
})