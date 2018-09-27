var rpws = {};

rpws.cachedToken = null;
rpws.checkedCookie = false;

//Libraries for accessing RPWS.
rpws.getTokenAsync = function(goodCallback, noTokenCallback) {
    //Check if we have the cookie stored locally on this site. If we do, we set it with the oauth in the browser.
    var cookie = Cookies.get("access_token");
    if(cookie != null) {
        goodCallback(cookie);
        return;
    }
    if(rpws.checkedCookie == false) {
        //We don't know if we have a valid token. Check.
        shared.serverRequest("https://romanport.com/api/getRpwsToken/", function(data) {
            if(data.ok) {
                rpws.cachedToken = data.token;
                rpws.checkedCookie  = true;
                goodCallback(rpws.cachedToken);
            } else {
                //No cookie.
                rpws.cachedToken = null;
                rpws.checkedCookie = true;
                noTokenCallback();
            }
        }, function() {
            //Failed to fetch. Return null, but check next time.
            noTokenCallback();
        }, true);
    } else {
        //We've checked before. Use cache.
        if(rpws.cachedToken != null) {
            goodCallback(rpws.cachedToken);
        } else {
            noTokenCallback();
        }
    }
}


rpws.getUuidFromLockerAsync = function(uuid, callback) {
    var output = {};
    output["installed"]=false;
    output["token"]=false;
    //first, check if the API is even enabled.
    rpws.getTokenAsync(function(apiToken) {
        //Fetch
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                //If this is 200, it is valid.
                data = JSON.parse(this.responseText);
                output["data"]=data["application"];
                output["installed"]=true;
                output["token"]=true;
                //Retrun
                callback(output);
            }
            if (this.readyState == 4 && this.status != 200) {
                //Not valid. Return unknown.
                output["token"]=true;
                callback(output);
            }
        }
        xmlhttp.ontimeout = function() {
            //Not valid. Return unknown.
            output["token"]=true;
            callback(output);
        }
        
        xmlhttp.onerror = function() {
            //Not valid. Return unknown.
            output["token"]=true;
            callback(output);
        }

        
        xmlhttp.onabort = function() {
            //Not valid. Return unknown.
            output["token"]=true;
            callback(output);
        }
        xmlhttp.open("GET", "https://me.pebbleapis.romanport.com/v1/locker/"+uuid+"/", true);
        //Set auth header
        xmlhttp.setRequestHeader("Authorization","Bearer "+apiToken);
        //Request
	    xmlhttp.send();
    }, function() {
        //No token.
        callback(output);
    })
}