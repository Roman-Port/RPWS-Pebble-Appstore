var viewman = {};
/* Manages views and transitions. */
viewman.views = {};
viewman.activeView = null;
/* Views are objects with these params:
var view = {};
view.node = {{HTML node to hide/show}}
view.init = {{JS function to call when init}}
view.deinit = {{JS function to call when closing the view.}}
*/

/* Constants */
var VIEWMAN_TRANSITION_TIME = 100;

/* Add view function */
viewman.addView = function(name, node, initFunction, deinitFunction, custom, friendlyName) {
    var view = {};
    view.node = node;
    view.name = name;
    view.friendlyName = friendlyName;
    view.scrollX = 0;
    view.scrollY = 0;
    view.custom = custom;
    view.init = initFunction;
    view.deinit = deinitFunction;
    viewman.views[name]=view;
}


/* Private functions */
viewman.privateOnReadyToSwitch = function(newViewName, context, doneCallback, beginLoadCallback) {
    /* This is called when it's time to actually switch. This might be after an animation to fade out the old view. */
    /* Call the begin load callback if it exists. */
    if(beginLoadCallback != null) {beginLoadCallback(view);}
    /* Grab the actual view itself. */
    var view = viewman.views[newViewName];
    viewman.activeView = view;
    /* Enable the active HTML node. */
    if(view.custom.doNotSetVisable == null) {
        view.node.style.display="block";
    } else {
        if(view.custom.doNotSetVisable == true) {
            view.node.style.display="block";
        }
    }

    //Update the URL
    var title = view.friendlyName;
    //If the friendly name is a function, call it to get the new title.
    if(typeof title === "function") {
        title = title();
    }
    native.SetBar(title);
    
    /* Reinit. The rest of this code will be called by the init function for the view when it's done loading. */
    view.init(view, function() {
        /* Set the scroll position back. */
        window.scrollTo(view.scrollX,view.scrollY);
        /* Begin to show this view by fading out the transition. */
        /* Check if we're using a custom transition. */
        var animation = viewman.setLoaderState;
        if(view != null) {
            if(view.custom.customAnimation != null) {
                animation = view.custom.customAnimation;
            }
        }
        animation(false, function() {
            /* Done. Call callback. */
            if(doneCallback != null) {
                doneCallback(view);
            }
        });
    }, context);
    
};

viewman.setLoaderState = function(state, callback) {
    var obj = document.getElementsByClassName('vloader_loader_screen')[0];
    if(state) {
        $(obj).addClass('vloader_loader_screen_active');
    } else {
        $(obj).removeClass('vloader_loader_screen_active');
        //Remove loader if it exists.
        document.getElementById('loader_bar').style.display="none";
    }
    if(callback != null) {
        window.setTimeout(callback,VIEWMAN_TRANSITION_TIME);
    }
}

viewman.popups = {};
viewman.popups.privateToastSetup = function(index,msg) {
    var content = document.getElementsByClassName('toast_message_inner')[index];
    var toast = document.getElementsByClassName('toast_message')[index];

    content.innerHTML = msg;
    $(toast).addClass('toast_message_drop');
}
viewman.popups.toastPendingTimeout = null;
viewman.popups.show_toast = function(msg, time) {
    viewman.popups.hide_toast();

    if(time == null) {
        time = 5000;
    }
    
    viewman.popups.privateToastSetup(0,msg);
    viewman.popups.privateToastSetup(1,msg);

    viewman.popups.toastPendingTimeout = window.setTimeout(function() {
        /* Start collapse */
        $('.toast_message').removeClass('toast_message_drop');
        viewman.popups.toastPendingTimeout = null;
        
    },time+100);
}
viewman.popups.hide_toast = function(callback) {
    if(viewman.popups.toastPendingTimeout != null) {
        clearTimeout(viewman.popups.toastPendingTimeout);
        $('.toast_message').removeClass('toast_message_drop');
    }
    window.setTimeout(callback,400);
}

viewman.pendingNavViews = []; 

/* Public Functions */
/* Usage: [Required]view name, [optional]Context that is passed into init, [optional]Callback for when the view begins to load, [Optional]Should push to history. Null for no, array with {url,title,context} if set. [Optional]Callback when the view is fully loaded*/
viewman.switchViewByNameAsync = function(newViewName, context, pushHistory, doneCallback, beginLoadCallback) {
    /* If we're currently in a view, hide it.*/
    /* Grab the actual view itself. */
    var view = viewman.activeView;
    var newView = viewman.views[newViewName];
    /* Respect the custom animations. */
    var animation = viewman.setLoaderState;
    
    
    /* Do logic */
    if(viewman.activeView != null) {
        /* Deinit and hide the active view. */
        /* If the old view uses a custom animation, apply it. */
        if(newView != null) {
            if(newView.custom.customAnimation != null) {
                animation = newView.custom.customAnimation;
            }
            
        }
        if(view != null) {
            if(view.custom.customAnimation != null) {
                animation = view.custom.customAnimation;
            }
            
        }
        
        /* If we're asked to set history, do it now. */
        if(pushHistory != null) {
            var state = {};
            state.oldView = JSON.parse(JSON.stringify(viewman.activeView));
            state.oldViewContext = pushHistory.context;
            viewman.pendingNavViews.push(state);
            shared.pushState(pushHistory.url,pushHistory.title,state);
        }
        /* Save scroll */
        viewman.views[view.name].scrollX = window.scrollX;
        viewman.views[view.name].scrollY = window.scrollY;
        /* Show loader */
        animation(true, function() {
            /* Disable the active HTML node. */
            if(view.custom.doNotSetVisable == null) {
                view.node.style.display="none";
            } else {
                if(view.custom.doNotSetVisable == true) {
                    view.node.style.display="none";
                }
            }
            /* Deinit. The remainder of this code will be run when the deinit code runs our callback. */
            view.deinit(view, function() {
                /* Begin loading the next one. */
                viewman.privateOnReadyToSwitch(newViewName, context, doneCallback, beginLoadCallback);
            });
            
        });
        
        
        
    } else {
        /* There is no active view. Switch views now. */
        viewman.privateOnReadyToSwitch(newViewName,context, doneCallback, beginLoadCallback);
    }
}

/* Set settings */
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}


/* Set popstate to handle back button requests. */
window.onpopstate = function(event) {
    console.log(event); 
    /* Pull the first state off of the stack if this exists. */
    if(viewman.pendingNavViews.length!=0 ) {
        var state = viewman.pendingNavViews.pop();
        /* Go to this state */
        var goBack = true;
        if(state.oldViewContext.dontSwitchBackView != null) {
            //If that is true, we don't actually switch back.
            if(state.oldViewContext.dontSwitchBackView == true) {
                goBack = false;
            }
        }
        if(goBack) {
            viewman.switchViewByNameAsync(state.oldView.name);
        }
        //Call the callback
        if(state.oldViewContext.callback != null) {
            eval(state.oldViewContext.callback);
        }
    } else {
        /* Just show the first view, the list. */
        viewman.switchViewByNameAsync("list");
    }
}

viewman.clickCatcherCallback = null;

/* Set the click catcher. */
viewman.setClickCatcher = function(z,callback) {
	viewman.clickCatcherCallback = callback;
	document.getElementById('clickCatcher').style="z-index:"+z+";";
	document.getElementById('clickCatcher').className='clickCatcher';
}

$(document).keyup(function(e) {
	if (e.keyCode == 27) { 
	   //If the click catcher is set, run the function.
	   if(clickCatcherCallback!=null) {
			clickCatcherCallback();
			UnsetClickCatcher();
	   }
   }
});

viewman.unsetClickCatcher = function() {
	document.getElementById('clickCatcher').className='clickCatcher clickCatcherDisable';
	clickCatcherCallback = null;
}