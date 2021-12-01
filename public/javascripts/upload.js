const input_video_preview = document.getElementById('upload-video-preview')
const sleep = msec => new Promise(resolve => setTimeout(resolve, msec))

async function show_input_video_preview(input_video_file) {
    input_video_preview.src = URL.createObjectURL(
        new Blob(
            [input_video_file],
            { type: 'video/mp4' }
        )
    );
    await sleep(1000)
    input_video_preview.currentTime = 0
}

async function load_video({ target: { files } }) {
    input_video_file = files[0]
    await show_input_video_preview(input_video_file)
    if(input_video_file){
        select_file_info_show(input_video_file.name)
    }
}

async function drop_load_video({ dataTransfer: { files } }) {
    input_video_file = files[0]
    await show_input_video_preview(input_video_file)
    if(input_video_file){
        select_file_info_show(input_video_file.name)
    }
}

const fileArea = document.getElementById('drag-area')
const fileInput = document.getElementById('uploader')

fileArea.addEventListener('dragover', function (e) {
    e.preventDefault()
    fileArea.classList.add('dragover')
});

fileArea.addEventListener('dragleave', function (e) {
    e.preventDefault()
    fileArea.classList.remove('dragover')
});


fileArea.addEventListener('drop', function (e) {
    e.preventDefault()
    fileArea.classList.remove('dragover')

    let files = e.dataTransfer.files

    fileInput.files = files
    let file = files[0]
    if (typeof e.dataTransfer.files[0] !== 'undefined') {
        if (file.type.match("video.*") || file.type.match("image.gif")) {
            console.log("ロード完了")
        }
        else {
            console.log("動画を選択してください")
        }
    } 
    else {
        console.log("ファイルが選択されませんでした")
    }
})

document.getElementById('uploader').addEventListener('change', load_video)
document.getElementById('drag-area').addEventListener('drop', drop_load_video)
document.getElementById('upload-form').action += "?ltik=" + params.get("ltik")

let upload_flag = false;


function upload_video(){
    let required_check = false
    document.getElementById("file-non-err").innerHTML = ""
    document.getElementById("title-non-err").innerHTML = ""

    const form = document.getElementById("upload-form");
    if(!form.in_file.value){
        required_check = true
        form.in_file.parentNode.parentNode.parentNode.parentNode.classList.add("required_input")
        document.getElementById("file-non-err").innerHTML = "動画ファイルを選択してください"
    }
    else{
        form.in_file.parentNode.parentNode.parentNode.parentNode.classList.remove("required_input")
    }
    if(!form.title.value){
        required_check = true
        form.title.parentNode.parentNode.classList.add("required_input")
        document.getElementById("title-non-err").innerHTML = "動画タイトルを入力してください"
    }
    else{
        form.title.parentNode.parentNode.classList.remove("required_input")
    }

    if(required_check){
        return
    }

    document.getElementById("upload-overlay").classList.toggle("on-overlay")
    document.getElementById("upload-btn").removeEventListener("click", upload_video, false)

    const fd = new FormData(form)

    try{
        const duration = document.getElementById("upload-video-preview").duration
        if(duration){
            fd.append("duration", duration)
        }
        else{
            fd.append("duration", 0)
        }
    }
    catch(e){
        fd.append("duration", 0)
    }

    let xhr = new XMLHttpRequest()
    xhr.open('post', "./upload" + "?ltik=" + params.get("ltik"), true)

    xhr.upload.addEventListener('progress', (evt) => {
        let percent = (evt.loaded / evt.total * 100).toFixed(1)
        document.getElementById('upload-percent').textContent = percent
        bar.animate(percent/100)
        console.log(`++ xhr.upload: progress ${percent}%`)
    });

    xhr.upload.addEventListener('timeout', (evt) => {
        document.getElementById("upload-info").innerHTML = "タイムアウトしました"
        console.log('++ xhr.upload: timeout')
    });

    xhr.onload = function () {
        if(xhr.status == 200){
            document.getElementById("upload-info").innerHTML = "アップロードが完了しました"
        }
        else{
            document.getElementById("upload-info").innerHTML = "<font color='red'>アップロードに失敗しました</font>"
        }
        document.getElementById("back-btn").classList.toggle("lock-btn")
        document.getElementById("back-btn").addEventListener('click', function(){
            window.location.href = "./videolist?ltik=" + params.get("ltik")
        })
    }

    if(!upload_flag){
        upload_flag = true
        xhr.send(fd)
    }
}
document.getElementById("upload-btn").addEventListener("click", upload_video, false)
document.getElementById("cancel-btn").addEventListener("click", function(){
    window.location.href = "./videolist?ltik=" + params.get("ltik")
}, false)

function select_file_info_show(file){
    document.getElementById("input_file_name").innerHTML = file
    document.getElementById("upload-title").value = file.slice(0, file.lastIndexOf("."))
    document.getElementById("drag-area").classList.toggle("drag-area-block-on")
    document.getElementById("drag-area-block").classList.toggle("drag-area-block-on")
    title_limit_change()
}

function re_select_file_info(){
    document.getElementById("drag-area-block").classList.toggle("drag-area-block-on")
    document.getElementById("drag-area").classList.toggle("drag-area-block-on")
    document.getElementById('uploader').value = ""
    document.getElementById('upload-video-preview').src=""
}
document.getElementById("re-select-btn").addEventListener("click", re_select_file_info, false)


function title_limit_change(){
    if(document.getElementById("upload-title").value.length > 40){
        document.getElementById("upload-title").value = document.getElementById("upload-title").value.slice(0,40)
    }
    document.getElementById("title-input-limit").innerHTML = document.getElementById("upload-title").value.length
}
document.getElementById("upload-title").addEventListener('input', title_limit_change);

function exp_limit_change(){
    if(document.getElementById("upload-explanation").value.length > 200){
        document.getElementById("upload-explanation").value = document.getElementById("upload-explanation").value.slice(0,200)
    }
    document.getElementById("exp-input-limit").innerHTML = document.getElementById("upload-explanation").value.length
}
document.getElementById("upload-explanation").addEventListener('input', exp_limit_change);