let contents_list
let openMenu = false

function closeMenuInit(){
    document.addEventListener('click', closeMenu)
}

function closeMenu(e){
    if(openMenu){
        if(e.target.id != openMenu){
            document.getElementById(openMenu).classList.remove("overlay-on")
            openMenu = false 
        }
    }
}

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
        a_div.title = list[element].title

        const menu_id = clone.querySelector('.content_menu')
        menu_id.setAttribute("id","menu-id-" + list[element].title)

        const menu_btn = clone.querySelector('.content_menu_btn')
        menu_btn.onclick = function(e){
            if(openMenu){
                document.getElementById(openMenu).classList.remove("overlay-on")
            }
            if(this.nextElementSibling.id != openMenu){
                this.nextElementSibling.classList.add("overlay-on")
                openMenu = this.nextElementSibling.id
            }
            else{
                openMenu = false 
            }
            e.stopPropagation()
        }

        if(!params.get("service")){
            const menu_copy = clone.querySelector('.content_menu_item_copy')
            menu_copy.remove()
        }
        else{
            const menu_copy = clone.querySelector('.content_menu_item_copy')
            menu_copy.onclick = function(e){
                copyOverlay(list[element].title)
                //e.stopPropagation()
            }
        }

        const menu_delete = clone.querySelector('.content_menu_item_delete')
        menu_delete.onclick = function(e){
            deleteServiceClass(list[element].title)
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

function deleteServiceClassInit(){
    document.getElementById("delete-service-class-cancel-btn").addEventListener("click",deleteServiceClassCancel)
    //document.getElementById("delete-service-class-add-btn").addEventListener("click",deleteServiceClassCheck)

    let request = new XMLHttpRequest()
    request.open('GET', "./DeleteAlert", true)
    request.onload = function () {
        if(request.status == 200){
            document.getElementById("delete-service-class-alert").innerHTML = marked.parse(request.response,{breaks: true})
        }
        else{
            document.getElementById("delete-service-class-alert").textContent = "取得できませんでした"
        }
    }
    request.send()
}

function deleteServiceClass(target){
    document.getElementById("delete-service-class-overlay").classList.add("overlay-on")
    document.getElementById("delete-service-class-example").textContent = target
    document.getElementById("delete-service-class-input").oninput = function(){
        deleteServiceClassInputCheck(target)
    }
}

function deleteServiceClassCancel(){
    document.getElementById("delete-service-class-overlay").classList.remove("overlay-on")

    document.getElementById("delete-service-class-run-btn").onclick = ""
    document.getElementById("delete-service-class-run-btn").classList.add("overlay-lock-btn")
    document.getElementById("delete-service-class-input").value = ""

    document.getElementById("delete-service-class-err").textContent = ""
}

function deleteServiceClassInputCheck(target){
    if(document.getElementById("delete-service-class-input").value == target){
        document.getElementById("delete-service-class-run-btn").onclick = function(){
            deleteServiceClassStatusCheck(target)
        }
        document.getElementById("delete-service-class-run-btn").classList.remove("overlay-lock-btn")
    }
    else{
        document.getElementById("delete-service-class-run-btn").onclick = ""
        document.getElementById("delete-service-class-run-btn").classList.add("overlay-lock-btn")
    }
}

async function deleteServiceClassStatusCheck(target){
    if(!params.get("service")){
        let request = new XMLHttpRequest()
        request.open('GET', "./classlist?service=" + target + "&ltik=" + params.get("ltik"), true)
        request.onload = async function () {
            let deleteServiceClassStatusFlag = false
            if(request.status == 200){
                const deleteServiceClassStatusList = JSON.parse(request.response)
                for(const delete_cid of deleteServiceClassStatusList){
                    const deleteStatus = await deleteServiceClassStatusGet(target,delete_cid)
                    if(deleteStatus > 0){
                        if(deleteStatus == 1){
                            document.getElementById("delete-service-class-err").textContent = "ステータスチェックに失敗しました"
                        }
                        else if(deleteStatus == 2){
                            document.getElementById("delete-service-class-err").textContent = "エンコード中のファイルがあります。エンコード終了までお待ちください"
                        }
                        else if(deleteStatus == 3){
                            document.getElementById("delete-service-class-err").textContent = "複製中のファイルがあります。複製終了までお待ちください"
                        }
                        deleteServiceClassStatusFlag = true
                        break
                    }
                }
            }
            
            if(!deleteServiceClassStatusFlag){
                deleteServiceClassRun(target)
            }
        }
        request.send()
    }
    else{
        const deleteStatus = await deleteServiceClassStatusGet(params.get("service"),target)
        let deleteServiceClassStatusFlag = false
        if(deleteStatus > 0){
            if(deleteStatus == 1){
                document.getElementById("delete-service-class-err").textContent = "ステータスチェックに失敗しました"
            }
            else if(deleteStatus == 2){
                document.getElementById("delete-service-class-err").textContent = "エンコード中のファイルがあります。エンコード終了までお待ちください"
            }
            else if(deleteStatus == 3){
                document.getElementById("delete-service-class-err").textContent = "複製中のファイルがあります。複製終了までお待ちください"
            }
            deleteServiceClassStatusFlag = true
        }

        if(!deleteServiceClassStatusFlag){
            deleteServiceClassRun(params.get("service"),target)
        }
    }
}

function deleteServiceClassStatusGet(service,cid){
    return new Promise((resolve, reject) => {
        let request = new XMLHttpRequest()
        request.open('GET', "./getvideolist?service=" + service + "&class=" + cid + "&ltik=" + params.get("ltik"), true)
        request.onload = function () {
            if(request.status == 200){
                const delete_check_list = JSON.parse(request.response)
                for(const vid_check in delete_check_list){
                    if(delete_check_list[vid_check].encode_tasks.length != 0){
                        return resolve(2)
                    }
                    else if("status" in delete_check_list[vid_check] && delete_check_list[vid_check].status.length != 0){
                        return resolve(3)
                    }
                }
                return resolve(0)
            }
            else{
                return resolve(1)
            }
        }
        request.send()
    })
}

function deleteServiceClassRun(service,cid=false){
    let request = new XMLHttpRequest()
    if(!cid){
        request.open('POST', "./deleteserviceclass?service=" + service + "&ltik=" + params.get("ltik"), true)
    }
    else{
        request.open('POST', "./deleteserviceclass?service=" + service + "&class=" + cid + "&ltik=" + params.get("ltik"), true)
    }
    
    request.onload = async function () {
        if(request.status == 200){
            let delete_value
            if(!cid){
                delete_value = service
            }
            else{
                delete_value = cid
            }
            const delete_index = contents_list.indexOf(delete_value)
            contents_list.splice(delete_index, 1)

            contentsfilter.updateOrigin = await toContentsList()
            contentsListDraw(contentsfilter.VideoList())
            deleteServiceClassCancel()
        }
        else{
            document.getElementById("delete-service-class-err").textContent = "削除に失敗しました"
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
    deleteServiceClassInit()
    newServiceClassInit()
    closeMenuInit()
})