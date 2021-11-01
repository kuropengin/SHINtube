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
                const regex = new RegExp(word, "gi")
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


videofilter = new VideoFilter({
    order : [{key: "created_at", reverse: false},{key: "updated_at", reverse: false}],
    filtertarget : ["title","explanation","contributor_name"],
    filterword : ""
})

function filterInit(){
    var filter_focus = function(){
        document.getElementById("filter-word").focus()
    }
    document.getElementById("filter-btn").addEventListener("click", filter_focus, false);  
}




window.addEventListener("load", function() {
    filterInit()
})
