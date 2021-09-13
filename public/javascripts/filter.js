class VideoFilter {
    constructor(settings) {
        this.origin = settings.origin || []
        this.order = settings.order || [{key: "title", reverse: false}]
        this.filtertarget = settings.filtertarget || ["title"]
        this.filterword = settings.filterword || ""

        this.sort_by = function(list) {
            return (a, b) => {
                for (let i=0; i<list.length; i++) {
                    const order_by = list[i].reverse ? 1 : -1
                    if (a[list[i].key] < b[list[i].key]) return order_by
                    if (a[list[i].key] > b[list[i].key]) return order_by * -1
                }
                return 0
            }
        }
        this.filter_by = function(word,target){
            return (a) => {
                const regex = new RegExp(word, "gi");
                const comparison = regex.test()
                for (let i=0; i<target.length; i++) {
                    if ( regex.test(a[target[i]]) ) return 1
                }
                return 0
            }
        }
    }


    VideoList() {
        let temp_list = this.origin.filter(this.filter_by(this.filterword,this.filtertarget))  
        temp_list.sort(this.sort_by(this.order))
        return temp_list
    }

    get Origin() {
        return this.origin
    }

    get FilterWord() {
        return this.filterword
    }

    get FilterOrder() {
        return this.order
    }

    get FilterTarget() {
        return this.filtertarget
    }

    set setFilterWord(value) {
        this.filterword = value
    }

    set setFilterOrder(value) {
        this.order = value
    }

    set setFilterTarget(value) {
        this.filtertarget = value
    }

    set updateOrigin(value) {
        this.origin = value
    }

}


function filterInit(){
    videofilter = new VideoFilter({
        order : [{key: "created_at", reverse: false},{key: "updated_at", reverse: false}],
        filtertarget : ["title","explanation"],
        filterword : ""
    })

    var filter_list_display = function(){
        document.getElementById("filter-list").classList.toggle("filter-list-hidden")
    }

    document.getElementById("filter-btn").addEventListener("click", filter_list_display, false);
    
    document.addEventListener("click", (e) => {
        if( !e.target.closest("#filter-list") && !e.target.closest("#filter-btn") && 
            !document.getElementById("filter-list").classList.contains("filter-list-hidden")){
            filter_list_display()
        } 
    })
    
    
    document.getElementById("filter-type-create-up").addEventListener("click", function(){
        videofilter.order = [
            {key: "created_at", reverse: false},
            {key: "updated_at", reverse: false}
        ]
        redraw_video_list()
    }, false);
    document.getElementById("filter-type-create-down").addEventListener("click", function(){
        videofilter.order = [
            {key: "created_at", reverse: true},
            {key: "updated_at", reverse: true}
        ]
        redraw_video_list()
    }, false);
    document.getElementById("filter-type-update-up").addEventListener("click", function(){
        videofilter.order = [
            {key: "updated_at", reverse: false},
            {key: "created_at", reverse: false}
        ]
        redraw_video_list()
    }, false);
    document.getElementById("filter-type-update-down").addEventListener("click", function(){
        videofilter.order = [
            {key: "updated_at", reverse: true},
            {key: "created_at", reverse: true}
        ]
        redraw_video_list()
    }, false);
    document.getElementById("filter-type-title-up").addEventListener("click", function(){
        videofilter.order = [
            {key: "title", reverse: false},
            {key: "created_at", reverse: false}
        ]
        redraw_video_list()
    }, false);
    document.getElementById("filter-type-title-down").addEventListener("click", function(){
        videofilter.order = [
            {key: "title", reverse: true},
            {key: "created_at", reverse: true}
        ]
        redraw_video_list()
    }, false);

}

window.addEventListener("load", function() {
    filterInit()
})
