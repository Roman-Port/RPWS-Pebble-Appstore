//Constants

//variables
var vlist = {};
vlist.offset = 0;
vlist.waiting = false;
vlist.hasData = false;

vlist.can = {};
vlist.can.next = false;
vlist.can.back = false;
//Functions

vlist.init = function(view, callback) {
    //Init the list view.
    vlist.updateUrl();
    vlist.setTypeSelectionButtons();
    /* If we don't have data, fetch it from the server. */
    if(vlist.hasData) {
        /* Show now */
        callback();
    } else {
        vlist.forceReload(callback);
    }

    
}

vlist.deinit = function(view, callback) {
    //Hide

    callback();
}

vlist.forceReload = function(callback) {
    /* Force a reload of the apps list. No fancy animations or anything. */
    document.getElementById('app_list_ul').innerHTML = "";
    window.scroll(0,0);
    vlist.getNewElementsAsync(function(html, data) {
        document.getElementById('app_list_ul').innerHTML = html;
        vlist.can = data.can;
        vlist.updatePageButtons();
        vlist.hasData = true;
        callback(); //Run the callback to show it.
    });
}

vlist.switchPage = function(pageOffset, callback) {
    vlist.fadeOutList(function() {
        searchOptions.offset += searchOptions.limit * pageOffset;
        vlist.forceReload(function() {
            vlist.fadeInList(function() {
                vlist.updateUrl();
                if(callback == null) {
                    callback = function() {

                    };
                }
                callback();
            });
        });
    });
}

vlist.pendingOperation = null;

vlist.setTypeSelectionButtons = function() {
    //Set watchapp/watchface buttons.
    //First, deselect both.
    $('.watchappsFacesSelectorButton').removeClass('watchappWatchfaceSelected');
    //Set the current one.
    $('#typeselect_'+searchOptions.type).addClass('watchappWatchfaceSelected');
}

vlist.switchType = function(newType) {
    searchOptions.type = newType;
    if(searchOptions.type == "watchface") {
        searchOptions.limit = 39;
    }
    if(searchOptions.type == "watchapp") {
        searchOptions.limit = 15;
    }
    searchOptions.offset = 0;
    //Reload
    vlist.hasData = false;
    searchOptions.category.value="";
    viewman.switchViewByNameAsync("list");
}

vlist.getNewElementsAsync = function(callback) {
    vlist.waiting = true;
    //Get new elements from the server and return a list of elements.
    
    /* Todo: Generate URL */
    vlist.pendingOperation = function() {
        shared.serverRequest(shared.getRequestUrl(searchOptions)+"&htmlonly=true",function(data) {
            /* The data returned is parsed JSON. Return the html. */
            callback(data.html,data);
            
            vlist.pendingOperation = null;
        }, function() {
            /* Failed */
            viewman.popups.show_toast("No Connection - <span style=\"text-decoration:underline;\" onclick=\"vlist.retryGetElements();\">Retry</span>",999999);
        }, true);
    }

    vlist.pendingOperation();

    vlist.waiting = false;
}

vlist.retryGetElements = function() {
    //Hide toast and then retry.
    viewman.popups.hide_toast(function() {
        vlist.pendingOperation();
    });
}

vlist.updateSinglePageButton = function(className, enabled) {
    if(enabled) {
        $('.'+className).removeClass('classic_button_disabled');
    } else {
        $('.'+className).addClass('classic_button_disabled');
    }
}

vlist.updatePageButtons = function() {
    vlist.updateSinglePageButton('nextPage',vlist.can.next);
    vlist.updateSinglePageButton('backPage',vlist.can.back);
}


/* List fading functions */
vlist.fadeInList = function(callback) {
    $(".appListUl").removeClass('appsListHiddenNew');
    window.setTimeout(callback,130);
}
vlist.fadeOutList = function(callback) {
    $(".appListUl").addClass('appsListHiddenNew');
    window.setTimeout(callback,130);
}

vlist.getTitle = function() {
    var name = searchOptions.type;
    name = name.charAt(0).toUpperCase() + name.substr(1);
    return name+"s";
}


vlist.updateUrl = function() {
    //Update the URL to resemble the settings.
    var url = "/"+searchOptions.type+"s/"+((searchOptions.offset/searchOptions.limit)+1)+"/?sort="+encodeURIComponent(searchOptions.sort.value);
    if(searchOptions.query.value.length != 0) {
        url+="&query="+encodeURIComponent(searchOptions.query.value);
    }
    if(searchOptions.category.value.length != 0) {
        url+="&category="+encodeURIComponent(searchOptions.category.value);
    }
    if(native.isNative == true) {
        var p = "ios";
        if(native.platformAndroid){p="android";}
        url+="&native=true&platform="+p;
    }
    shared.setUrl(url);
    return url;
}

vlist.checkIfSortButtonIsBelowButtons = function() {
    //See if it is below.
    var navBtns = document.getElementById('bottomNavButtons');
    var sortBtn = document.getElementById('sortBtn');
    var fakeSort = document.getElementById('fakeSortBtn');
    var navBtnsDist = shared.getDistanceFromTopOfPage(navBtns);
    var offset = -($(navBtns).height()/2);
    if(navBtnsDist + offset < shared.getDistanceFromTopOfPage(fakeSort)) {
        //Make the sort button sit on top of the nav buttons.
        /*sortBtn.style.position="absolute";
        sortBtn.style.bottom = "unset";
        var dist = navBtnsDist + offset; 
        console.log(dist);
        sortBtn.style.top = dist.toString()+"px";*/
        
        //Check if the screen is small enough to matter.
        if(window.innerWidth < 830) {
            $(sortBtn).addClass("searchButtonCollapse");
        }
    } else {
        //Set to normal
        /*sortBtn.style.position="";
        sortBtn.style.bottom = "";
        sortBtn.style.top = "";*/
        $(sortBtn).removeClass("searchButtonCollapse");
    }
}

window.addEventListener('scroll', vlist.checkIfSortButtonIsBelowButtons);

function HideImgLoader(id) {
    /* Old function just to show the image. */
    document.getElementById(id).style.opacity = 0;
}

function ShowAppInfo(id) {
    //Switch the view to this app's view.
    var state = {};
    state.id = id;
    var history = {};
    history.url="/app/"+id;
    history.context = state;
    history.title="App - RPWS Appstore";
    viewman.switchViewByNameAsync("item",state,history);
}


