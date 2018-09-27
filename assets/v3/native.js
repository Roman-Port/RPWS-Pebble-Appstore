var native = {};
native.private = {};

native.private.callbackId=0;
native.private.callbacks = [];


native.platformAndroid=true;
native.isNative = false;


					
native.private.send = function(methodName, args, responseCallback, sendCallback)  {
    console.log("native call",methodName,args);
    //Check if we're the native app. Doing this outside of the native app will remove our HTTPS message!
    if(!native.isNative) {
        return;
    }
    
	
	
	var _callbackId = -1;
	if(typeof(responseCallback)=="function") {
		native.private.callbacks.push(responseCallback);
		_callbackId = native.private.callbackId;
		native.private.callbackId+=1;
	}
	
	
	
	var uri = native.private.buildURI(methodName,_callbackId,args);
	var iframe = document.createElement("iframe");
	iframe.setAttribute("src", uri),
	iframe.setAttribute("height", "100px"),
	iframe.setAttribute("width", "1px"),
	document.documentElement.appendChild(iframe),
	iframe.parentNode.removeChild(iframe),
	iframe = null
}
				
				
native.private.buildURI = function(methodName, _callbackId, args) {
	var msg = native.private.encodeMsg(methodName, _callbackId, args)
	  , protocol = "pebble-method-call-js-frame://"
	  , queryCharacter = native.platformAndroid === false ? "?" : ""
      , uri = protocol + queryCharacter + "method=" + methodName + "&args=" + msg;
    
	return uri;
}
native.private.encodeMsg = function(methodName, _callbackId, args) {
	var msgStringified, msg = {
		methodName: methodName,
		callbackId: _callbackId,
		data: args
	};
	try {
		msgStringified = JSON.stringify(msg)
	} catch (e) {
		alert("[ERROR Native] msg cannot be JSON encoded", e)
	}
	var msgURIEncoded;
	try {
		msgURIEncoded = encodeURIComponent(msgStringified)
	} catch (e) {
		alert("[ERROR Native] msg cannot be URI encoded", e)
	}
	return msgURIEncoded
}

native.currentBar = null;

/* Friendlier */
native.SetBar = function(name) {
	navBarText = name;
	native.currentBar = name;
	document.title=name+" - RPWS Appstore"
	native.private.send("setNavBarTitle", {
        title: name,
        show_share: 0
    })
}

native.SetActiveApp = function(app) {
	var appData ={};
	appData.links={};
	appData.links.share=window.location.protocol+"//"+window.location.host+"/app/"+vitem.runtime.data.id;
	native.private.send("setVisibleApp", appData);
	//Show share
	native.private.send("setNavBarTitle", {
        title: "App",
        show_share: !0
    })
}

native.DownloadAndOpenPBW = function(pbwJSON,loadCallback,finishCallback) {
    var screenshot = pbwJSON.screenshot_images[0];
	var keys = Object.keys(screenshot);
	var icon = "";

	if(pbwJSON.icon_image != null) {
		if(pbwJSON.icon_image["48x48"] != null) {
			icon = pbwJSON.icon_image["48x48"];
		}
	}

	var args = {
		id: pbwJSON.id, 
		uuid: pbwJSON.uuid, 
		title: pbwJSON.title,
		list_image: pbwJSON.list_image["144x144"],
		icon_image: icon,
		screenshot_image: screenshot[keys[0]],
		type: pbwJSON.type,
		pbw_file: pbwJSON.latest_release.pbw_file,
		links: {
			add: 'https://dev-portal.getpebble.com/api' + "/applications/" + pbwJSON.id + "/add",
			remove: 'https://dev-portal.getpebble.com/api' + "/applications/" + pbwJSON.id + "/remove",
			share: window.location.protocol+"//"+window.location.host+"/app/"+vitem.runtime.data.id
		}
	};
	loadCallback();
	native.private.send("loadAppToDeviceAndLocker", args,finishCallback);
	console.log(args);
	
}



/* Functions used to handle requests from the app */



function PebbleBridge() {
	
	//This is nested because the Pebble native app calls it as such.
	//This function must be called first.
	function handleRequest(args) {
        
        
        switch (args.methodName) {
        case "search":
            /* This is the native search button. If we have a query, go to it. If not, (on iOS), just show the search and filter screen. */ 
            var q = args.query;
            if(q != null) {
                searchOptions.query.value = q;
                /* Just reload */
                vlist.hasData = false;
                viewman.views["sort"].scrollY = 0;
                viewman.switchViewByNameAsync("list");
            } else {
                /* Show sort and filter */
                vsort.show();
            }
            

            break;
        case "navigate":
            break;
        case "refresh":
            break;
        }
    }
    
    function handleResponse(args) {
        //Run callback
        var cbId = parseInt(args.native.private.callbackId);
        if(cbId != -1) {
            native.private.callbacks[cbId](args);
        }
        
        
        switch (args.methodName) {
            case "loadAppToDeviceAndLocker":
                
                break;
        }
    }
	
	window.PebbleBridge.handleRequest = handleRequest;
	window.PebbleBridge.handleResponse = handleResponse;
}

PebbleBridge();


function Analytics() {
	//This function does nothing but ensure the app doesn't crash.
	
	function logRouteLoaded() {
		//Blank
	}
	
	/*function(
	
	templateUrl: "views/directives/pbl-add-btn.html",
            restrict: "E",
            scope: {
                app: "="
            },
            link: function(scope) {
                scope.Analytics = Analytics, scope.storeUrl = config.STORE_URL, scope.isMobileBrowser = config.IS_MOBILE_BROWSER, scope.isWebview = config.IS_WEBVIEW
            }*/
	
	window.Analytics.logRouteLoaded=logRouteLoaded;
}


/* Keeping the native app happy */
var service=Object;
service._navigateTo = function(args) {
	haltAppAndShowError(args);
}