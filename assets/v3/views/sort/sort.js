var vsort = {};

vsort.init = function(view,callback) {
    callback();
}

vsort.deinit = function(view,callback) {
    callback();
}

vsort.null = function(view,callback) {
    window.setTimeout(callback,200);
}

vsort.animate = function(state,callback) {
    /* Play animation to go in and out. */
    $('#newSortOuterContainer').toggleClass('newSortOuterContainerActive');
    $('#newSortInnerContainer').toggleClass('newSortInnerContainerActive');
    $('#newSortBottom').toggleClass('newSortButtonActive');
    $('#newSortBg').toggleClass('newSortBgActive');
    $('#aboutPane').toggleClass('newSortInnerContainer');
    /* Call callback */
    
}

vsort.show = function() {
    if(vsort.active) {
        return;
    }
    window.setTimeout(function() {
        vlist.fadeOutList(function(){});
    },200);
    vsort.active = true;
    //We're gonna set the menu's value to the current.
    vsort.settings = JSON.parse(JSON.stringify(searchOptions));
    vsort.runtime.syncMenuToOptions();
    vsort.runtime.updateLiveResults();
    //Now, disable categories if using watchfaces.
    if(searchOptions.type == "watchface") {
        document.getElementById('sortV3CategorySelect').style.display = "none";
    } else {
        document.getElementById('sortV3CategorySelect').style.display = "block";
    }
    vsort.animate(null,function() {
    });

    viewman.switchViewByNameAsync("sort",null,null,null,function() {
        
    });
}

vsort.hide = function() {
    viewman.views["sort"].scrollY = 0;
    vsort.active = false;
    viewman.switchViewByNameAsync("list",null,null,null,function() {
        vsort.animate(null,function() {
        });
    });
}

vsort.active = false;

vsort.toggle = function() {
    if(vsort.active) {
        vsort.hide();
    } else {
        vsort.show();
    }
    vlist.updateUrl();
}




vsort.runtime = {};
vsort.settings = {};
vsort.settings.category = {};
vsort.settings.sort = {};
vsort.settings.category.value = "";
vsort.settings.sort.value = "POPULAR";
vsort.settings.query = {};
vsort.settings.query.value="";
vsort.settings.offset = 0;
vsort.settings.limit = 1;


vsort.runtime.NewSortButtonPressed = function(e,type,value) {
    $('.newSortCategoryButtonToggle'+type).removeClass('newSortCategoryButtonSelected');
	if(type==0) {
		if(vsort.settings.category.value==value) {
			//Deselect
			$(e).removeClass('newSortCategoryButtonSelected');
			vsort.settings.category.value = "";
		} else {
			//Select
			vsort.settings.category.value = value;
			$(e).addClass('newSortCategoryButtonSelected');
		}
		
	}
	
	if(type==1) {
		//Select
		vsort.settings.sort.value = value;
		$(e).addClass('newSortCategoryButtonSelected');
	}
	
	//Update live results
    vsort.runtime.updateLiveResults();
	
}

vsort.runtime.QueryModified = function(context) {
    vsort.settings.query.value = context.value;

    //Update live results
    vsort.runtime.updateLiveResults();
}

vsort.runtime.updateLiveResults = function(callback) {
    vsort.settings.type = searchOptions.type;
    //Ask the server how many results we need.
    vsort.settings.limit = 15;
    if(vsort.settings.type == "watchface") {
        vsort.settings.limit = 39;
    }
    shared.serverRequest(shared.getRequestUrl(vsort.settings)+"&basic=true",function(data) {
        /* The data returned is parsed JSON.  */
        var pages = data.totalPages;
        document.getElementById('sortV3Max').innerText = pages;
        document.getElementById('sortV3PageSlider').max = pages;
        if(callback != null) {
            callback();
        }
        vsort.runtime.sliderChanged();
    }, function() {
        /* Failed */
    }, true);
}

vsort.runtime.sliderChanged = function() {
    var html = "";
    var value = document.getElementById('sortV3PageSlider').value.toString();
    vsort.settings.offset = (parseInt(value)*vsort.settings.limit)-vsort.settings.limit;
    //sortV3PageSelectTextLetter
    for (var i = 0; i < value.length; i++) {
        html += '<div class="sortV3PageSelectTextLetter">'+value.charAt(i)+"</div>";
    }
    document.getElementById('sortV3Current').innerHTML = html;
}

vsort.runtime.syncMenuToOptions = function() {
    //Sync menu to vsort.settings.
    //First, deselect everything
    $('.newSortCategoryButtonToggle0').removeClass('newSortCategoryButtonSelected');
    $('.newSortCategoryButtonToggle1').removeClass('newSortCategoryButtonSelected');
    //Reset curernt.
    //Choose the current category if any.
    if(vsort.settings.category.value != "") {
        //Toggle
        var cat = vsort.settings.category.value;
        $('#searchUiV3_'+cat).addClass('newSortCategoryButtonSelected');
    }
    //Now, choose sort type 
    var sort = vsort.settings.sort.value;
    $('#searchUiV3_'+sort).addClass('newSortCategoryButtonSelected');
    //Update slider.
    var page = (vsort.settings.offset / vsort.settings.limit)+1;
    document.getElementById('sortV3PageSlider').value = page;
    vsort.runtime.updateLiveResults(function() {
        document.getElementById('sortV3PageSlider').value = page;
    });
}

vsort.runtime.showLegalInfo = function() {
    var flag = '';
    if(native.isNative) {
        flag='native';
    }
    var html='<iframe src="https://pebble-appstore.romanport.com/assets/v3/about.html#'+flag+'" style="width:100%; height:calc(100% - 10px); border:none;"></iframe>';
    vcustom.showNew(html,"Okay", function() {

    }, "More Info");
}

vsort.searchInProgress = false;

vsort.runtime.confirm = function() {
    //Apply the settings.
    searchOptions = JSON.parse(JSON.stringify(vsort.settings));
    //Disable button
    $('searchSortBtn').addClass('classic_button_disabled');
    vsort.searchInProgress = true;
    //Update
    vlist.forceReload(function() {
        vlist.fadeInList(function(){vsort.searchInProgress = false; $('searchSortBtn').removeClass('classic_button_disabled');});
    });
    //Get rid of this
    vsort.hide();
    
    vlist.updateUrl();
}