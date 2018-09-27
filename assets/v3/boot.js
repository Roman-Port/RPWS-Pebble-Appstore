/* Ran to complete setup. Not part of any view. */

/* First, get settings from the URL. */
function boot() {
    //Parse args
    var parsed = shared.parseURLParams();
    if(parsed != null) {
        if(parsed.native != null) {
            native.isNative = parsed.native == "true";
        }
        if(parsed.platform != null) {
            native.platformAndroid = parsed.platform == "android";
        }
    }
    var requestedAppId = LoadSearchOptionsFromUrl();
    if(requestedAppId!=null) {
        //We're requesting an app.
        var state = {};
        state.id = requestedAppId;
        viewman.switchViewByNameAsync("item",state,null);
    } else {
        //No app requested. Show the list view.
        viewman.switchViewByNameAsync("list");
    }

    
}

boot();