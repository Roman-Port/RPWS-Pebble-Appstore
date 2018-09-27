var shared = {};

shared.changeState = function(url,title,state) {
    history.replaceState(state, title, url);
    window.title = title;
}

shared.setUrl = function(url) {
    history.replaceState({}, window.title, url);
}

shared.pushState = function(url,title,state) {
    history.pushState(state, title, url);
    window.title = title;
}

shared.getRequestUrl = function(conf) {
    var url = "https://pebble-appstore.romanport.com/api/v2.1/?platform=basalt";
    url+="&type="+conf.type;
    url+="&search="+encodeURIComponent(conf.query.value);
    url+="&category="+encodeURIComponent(conf.category.value);
    url+="&sort="+encodeURIComponent(conf.sort.value);
    url+="&offset="+conf.offset;
    url+="&limit="+conf.limit;
    return url;
}

shared.parseURLParams = function() { 
	try {	
		var query = window.location.search;
		var objects = String(query).trim("?").split("&");
		//Create keys and objects.
		var i =0;
		var keys = [];
		var obj = {};
		while(i<objects.length) {
			try {
				var o = objects[i];
				//Trim beginning
				o = o.replace("?","").replace("&","");
				//Split by equals.
				var oo = o.split("=");
				keys.push(oo[0]);
				//Uri decode both of these
				var key = decodeURIComponent(oo[0]);
				var value = decodeURIComponent(oo[1]);
				obj[key] = value;
			} catch (e) {

			}
			i+=1;
		}
		return obj;
	} catch (ex) {
		return {};
	}
}

shared.getDistanceFromTopOfPage = function(e) {
    return $(e).offset().top;
}

shared.openExternal = function(url) {
    if(native.isNative) {
        native.private.send("openURL", {
            url:url
        })
    } else {
        window.open(url,'_blank');
    }
}

shared.downloadFile = function(url) {
    var iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.display = "none";
    document.body.appendChild(iframe);
}

shared.formatDate = function(dateString) {
    try {
        var date = new Date(dateString);
        var monthNames = [
            "Jan", "Feb", "Mar",
            "Apr", "May", "Jun", "Jul",
            "Aug", "Sep", "Oct",
            "Nov", "Dec"
            ];
            
        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();
        var hour = date.getHours()+1;
        var ampm = "AM";
        if(hour >= 12) {
            ampm = "PM";
            if(hour > 12) {
                hour=hour - 12;
            }
        } 
        
        return monthNames[monthIndex] + ' ' + day + ', ' + year+' at '+hour+':'+date.getMinutes()+' '+ampm;
    } catch (e) {
        return dateString;
    }
}

shared.serverRequest = function(url, run_callback, fail_callback, isJson) {
    //This is the main server request function. Please change all other ones to use this.
	if(isJson==null) {isJson = true;}
	
	if(fail_callback==null) {
		//Just create a dumb function
		
	}
	var xmlhttp = new XMLHttpRequest();
	
	xmlhttp.timeout=10000;
	
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			if(isJson) {
				//This is JSON.
				//This is most likely to be valid, but check for errors.
				var JSON_Data;
				try {
					JSON_Data = JSON.parse(this.responseText);
				} catch (e) {
					fail_callback("JSON Parse Error", true);
					return;
				}
				if(JSON_Data["maintenance"] != null) {
					if(JSON_Data["maintenance"] == true) {
						//Stop and show maintance mode message.
						DisplayApiMaintenanceMsg(JSON_Data["maintenance_msg"]);
					}
					
				}
				if(JSON_Data.error!=null) {
					//Server-side error!
					fail_callback(JSON_Data.error +" - Check Console", true);
					console.log("A server error ("+JSON_Data.error+") occurred and data could not be grabbed. Error: "+JSON_Data.raw_error);
					return;
				} else {
					//Aye okay here. Call the callback.
					run_callback(JSON_Data);
					return;
				}
			} else {
				//Just return it
				run_callback(this.responseText);
			}
		}  else if (this.readyState==4) {
			//Got an invalid request.
			fail_callback("HTTP Error "+this.status, true);
		}
	}
	
	xmlhttp.ontimeout = function() {
		fail_callback("No Connection", false);
	}
	
	xmlhttp.onerror = function() {
		fail_callback("No Connection", false);
	}
	
	xmlhttp.onabort = function() {
		fail_callback("Abort", false);
	}
	//Todo: Add timeout error.
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
};