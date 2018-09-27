var vcustom = {};
//Custom views

vcustom.init = function(view,callback) {
    callback();
}

vcustom.deinit = function(view,callback) {
    callback();
}

vcustom.null = function(view,callback) {
    window.setTimeout(callback,200);
}

vcustom.animate = function(state,callback) {
    /* Play animation to go in and out. */
    $('#newSortOuterContainerCustom').toggleClass('newSortOuterContainerActive');
    $('#newSortInnerContainerCustom').toggleClass('newSortInnerContainerActive');
    $('#newSortBottomCustom').toggleClass('newSortButtonActive');
    $('#newSortBgCustom').toggleClass('newSortBgActive');
    /* Call callback */
    
}

vcustom.active = false;
vcustom.callback = null;
vcustom.oldTitle = null;

/* Functions to call */
vcustom.showNew = function(html, okayButtonText, callback, title) {
    if(okayButtonText == null) {
        okayButtonText = "Okay";
    }
    vcustom.oldTitle = native.currentBar;
    if(title == null) {
        title = "Info";
    }
    native.SetBar(title);
    document.getElementById('customViewOkay').innerHTML = okayButtonText;
    document.getElementById('newSortInnerContainerCustom').innerHTML = html;
    vcustom.callback = callback;
    if(!vcustom.active) {
        vcustom.active = true;
        vcustom.animate();
    }
}

vcustom.done = function() {
    //Called by the ok button.
    if(vcustom.callback != null) {
        vcustom.callback();
    }
    if(vcustom.active) {
        vcustom.active = false;
        vcustom.animate();
    }
    native.SetBar(vcustom.oldTitle);
}