//Variables
var vitem = {};
vitem.runtime = {};
vitem.runtime.data = null;

vitem.init = function(view, callback,context) {
    //Request the item from the server.
    var url = "https://pebble-appstore.romanport.com/api/v2.1/?offset=0&limit=1&appID="+context.id;
    shared.serverRequest(url,function(data) {
        /* The data returned is parsed JSON. */
        if(data.data.length!=1) {
            //Problem
        } else {
            //Set the data.
            vitem.setView(data.data[0],callback);
        }
    }, function() {
        /* Failed */
    }, true);

}

vitem.hideBannerLoader = function() {
    //Hide the loader for the header image.
    $('#banner_loader').addClass('no_opacity');
}

vitem.setLikeStatus = function(heartData) {
    var userHearts = heartData.total;
    //Set the number of hearts the app has in the DOM.
    document.getElementById('hearts_amount').innerText = (userHearts + parseInt(vitem.runtime.data.hearts));
    //Set the status
    var ele = document.getElementById('heart_icon');
    if(heartData.liked) {
        ele.src="/resources/favorite_active.svg";
    } else {
        ele.src="/resources/favorite.svg";
    }
}

vitem.refreshLikes = function(data, token) {
    shared.serverRequest("https://romanport.com/api/PebbleRipper/globalHearts.php?id="+data.id+"&action=CHECK&token="+token, function(heartData) {
        vitem.setLikeStatus(heartData);
    })
}

vitem.setView = function(data,callback) {
    //First, set all of the metadata.
    document.getElementById('title_card').innerText = data.title;
    document.getElementById('author_card').innerText = data.author;
    var verifiedBadge = '';
    if(data.is_user_verified == true) {
        verifiedBadge = '<img src="https://romanport.com/static/icons/baseline-verified-user.svg" style=" height: 15px; "> ';
    }
    document.getElementById('meta').innerHTML = verifiedBadge+data.author+"<br>"+data.category_name+"<br>"+shared.formatDate(data.latest_release.published_date)+"<br>"+data.latest_release.version;
    document.getElementById('description_card').innerHTML = data.description;

    vitem.runtime.data = data;

    //Do some sever request stuff.
    var doneRequests = 0;
    var onRequestFinished = function() {
        /* Check if all requests are done. If they are, run the final callback. */
        doneRequests += 1;
        if(doneRequests == 3) {
            callback();
        }
    }
    
    //Check if the app is liked by us.
    rpws.getTokenAsync(function(token) {
        vitem.refreshLikes(data,token);
        onRequestFinished();
    }, function() {
        vitem.refreshLikes(data,"");
        onRequestFinished();
    });

    //Check if this app is installed against the locker
    rpws.getUuidFromLockerAsync(data.uuid, function(locker) {
        var installed = locker.installed;
        vitem.runtime.added = installed;
        if(installed) {
            vitem.addbtn.setstate_added();
        } else {
            vitem.addbtn.setstate_add();
        }
        onRequestFinished();
    });

    //Add the app assets to the DOM.
    var screenshotsCard = document.getElementById('screenshots_card');
    for(var i = 0; i<data.screenshot_images.length; i+=1) {
        var screenshot = data.screenshot_images[i];
        var key = Object.keys(screenshot)[0];
        screenshot = screenshot[key];
        screenshotsCard.innerHTML+="<div class=\"carousel-cell\"><img src=\""+screenshot+"\" class=\"drop_shadow app_fullcard_screenshots_img\" ></div>";
    }

    //Add banner if it exists
    if(data.header_images.length==0) {
		//No banner. Hide it.
		document.getElementById('banner_card').style.display="none";
        document.getElementById('banner_loader').style.display="none";
        document.getElementById('banner_card_container').style.display="none";
		
	} else {
		//There is a banner. Reset back to normal!
		document.getElementById('banner_card').style.display="inline-block";
		document.getElementById('banner_card_container').style.paddingTop="44.4%;"; //Set aspect ratio of container to show it.
        document.getElementById('banner_loader').style.display="block";
        document.getElementById('banner_card_container').style.display="block";
		var urlToBanner = data.header_images[0].orig;
		var img = document.createElement('img');
		img.onload = vitem.hideBannerLoader;
		img.src = urlToBanner;
        img.style="width:100%;"
        
        

		document.getElementById('banner_card').appendChild(img);
    }

    //Init Flickity for the screenshots.
    $('#screenshots_card').flickity({
        cellAlign: 'center',
        prevNextButtons: false,
        pageDots: false,
        imagesLoaded: true
    });

    //Set type
    searchOptions.type = data.type;

    //Set title
    native.SetActiveApp(data);

    //Show buttons.
    vitem.privateSetBtn(data.companions.android != null,'download_android');
    vitem.privateSetBtn(data.companions.ios != null,'download_ios');
    vitem.privateSetBtn(data.source != "",'sourceBtn');
    vitem.privateSetBtn(data.website != "",'websiteBtn');
    
    //Once we're done, add the flag.
    onRequestFinished();

    console.log(data);
}

vitem.privateSetBtn = function(state, elementName) {
    if(state) {
        document.getElementById(elementName).style.display="block";
    } else {
        document.getElementById(elementName).style.display="none";
    }
}

vitem.deinit = function(view, callback) {
    //Deinit Flickity.
    $('#screenshots_card').flickity('destroy');
    //Clear screenshots.
    document.getElementById('screenshots_card').innerHTML="";
    //Set scroll to zero.
    view.scrollX = 0;
    view.scrollY = 0;
    //Clear banner
    document.getElementById('banner_card').innerHTML="";
    callback();
}

vitem.addbtn = {};

vitem.addbtn.setstate_add = function () {
	var h = vitem.addbtn.get();
	h.innerHTML="ADD";
	$(h).removeClass("addBtnAdded");
	
}

vitem.addbtn.setstate_load = function() {
	var h = vitem.addbtn.get();
	h.innerHTML='<div class="appinstall-loader"></div>';
	$(h).removeClass("addBtnAdded");
}

vitem.addbtn.setstate_added = function() {
	var h = vitem.addbtn.get();
	h.innerHTML="ADDED";
	$(h).addClass("addBtnAdded");
	added=true;
}

vitem.addbtn.get = function() {
	return document.getElementById('getButtonInside');
}


/* Runtime buttons */
vitem.runtime.changelog = function() {
    var html="<h2>Changelog</h2>";
    for(var i = 0; i<vitem.runtime.data.changelog.length; i++) {
        var cl = vitem.runtime.data.changelog[i];
        html+="<h3>Version "+cl.version+" ("+shared.formatDate(cl.published_date)+")</h3>";
        html+="<p>"+cl.release_notes+"</p>";
    }
    //Todo: Build HTML
    vcustom.showNew(html);
}

vitem.runtime.downloadPbw = function() {
    var url = vitem.runtime.data.latest_release.pbw_file;
    shared.downloadFile(url);
}

vitem.runtime.submitTakedown = function() {
    var url = "https://docs.google.com/forms/d/e/1FAIpQLSfSbEOSPM7SlPaCakzO361suATTwbev4Uxz_Cd7kO4oRLMrKA/viewform?entry.913311772="+vitem.runtime.data.id;
    shared.openExternal(url);
}

vitem.runtime.openCompanion = function(type) {
    var url = vitem.runtime.data.companions[type].url;
    shared.openExternal(url);
}

vitem.runtime.openLink = function(key) {
    shared.openExternal(vitem.runtime.data[key]);
}

vitem.runtime.likeButtonPressed = function() {
    //Swap the like status. Try to get the token.
    var noAuthCallback = function() {
        if(!native.isNative) {
            vitem.ShowRpwsLikeAd();
        }
    };

    rpws.getTokenAsync(function(token) {
        var url = "https://romanport.com/api/PebbleRipper/globalHearts.php?id="+vitem.runtime.data.id+"&action=SWAP&token="+token;
        shared.serverRequest(url, function(heartData) {
            vitem.setLikeStatus(heartData);
        }, function() {
            
        }, true);
    }, function() {
        //No token
        noAuthCallback();
    })
}

vitem.runtime.getButtonPressed = function() {
    //Install if on mobile.
    if(native.isNative) {
        if(!vitem.runtime.added) {
            native.DownloadAndOpenPBW(vitem.runtime.data, function(){}, function() {});
            vitem.addbtn.setstate_added();
            vitem.runtime.added = true;
        }
    } else {
        vitem.showDownloadOptionsModal();
    }
    
}

vitem.runtime.downloadOptionsButton_DownloadPatched = function() {
	//First, set the content.
	vitem.runtime.setDownloadOptionsText("Patching now...");
	//Now, make a request to the patch API
	shared.serverRequest("https://pebble-appstore.romanport.com/api/patcher/?id="+vitem.runtime.data.id+"&url=me.pebbleapis.romanport.com",function(data) {
		data = JSON.parse(data);
		if(data.finished) {
			//Download
			var pbw = data.href;
			shared.downloadFile(pbw);
			//Close
			vitem.hideDownloadOptionsModal();
		}
		if(data.failed) {
			//Error! Set text to error.
			vitem.runtime.setDownloadOptionsText(data.error);
		}
	}, function() {
		//Error! Set text to error.
		vitem.runtime.setDownloadOptionsText("Failed.");
	}, false);

}

vitem.runtime.setDownloadOptionsText = function(text) {
	document.getElementById('DownloadModalContent').innerHTML="<div class=\"DownloadOptionsModalContentTempText\">"+text+"</div>";
}

vitem.runtime.downloadOgPbw = function() {
    shared.downloadFile(vitem.runtime.data.latest_release.pbw_file);
    vitem.hideDownloadOptionsModal();
}

vitem.runtime.downloadOptionsButton_RemoveFromLocker = function() {
	//First, set the content.
	vitem.runtime.setDownloadOptionsText("Removing from locker...");
	//Request server
	shared.serverRequest("/rpws-oauth/locker-add-proxy/?action=delete&app="+vitem.runtime.data.uuid,function(data) {
		if(data.added) {
			//Set the button to "add";
			vitem.addbtn.setstate_add();
			vitem.runtime.added = false;
			//Now, dismiss this.
			vitem.hideDownloadOptionsModal();
		} else {
			//Huh. Failed.
			vitem.runtime.setDownloadOptionsText("Failed.");
		}
	}, function() {
		//Error! Set text to error.
		vitem.runtime.setDownloadOptionsText("Failed.");
	}, true);

}

vitem.runtime.downloadOptionsButton_AddToLocker = function() {
	//First, set the content.
	vitem.runtime.setDownloadOptionsText("Adding to locker...");
	//Request server
	shared.serverRequest("/rpws-oauth/locker-add-proxy/?action=put&app="+vitem.runtime.data.uuid,function(data) {
		if(data.added) {
			//Set the button to "add";
			vitem.addbtn.setstate_added();
			vitem.runtime.added = true;
			//Now, dismiss this.
			vitem.hideDownloadOptionsModal();
		} else {
			//Huh. Failed.
			vitem.runtime.setDownloadOptionsText("Failed.");
		}
	}, function() {
		//Error! Set text to error.
		vitem.runtime.setDownloadOptionsText("Failed.");
	}, true);

}

vitem.runtime.downloadOptionsButton_SignIntoRpws = function() {
	var returnTo = "?token=token_pbl_rpws&returnto="+vitem.runtime.data.id;
	window.location="https://get-rpws.com/oauth/?callback_domain="+window.location.host+"&callback_path=%2Frpws-oauth%2Fcallback"+encodeURIComponent(returnTo);
}


vitem.ShowRpwsLikeAd = function() {
	document.getElementsByClassName('getRpwsAd')[0].className="DownloadOptionsModal DownloadOptionsModalActive getRpwsAd";
	viewman.setClickCatcher(101,function() {
		vitem.HideRpwsLikeAd();
	});
}

vitem.HideRpwsLikeAd = function() {
	document.getElementsByClassName('getRpwsAd')[0].className="DownloadOptionsModal getRpwsAd";
	viewman.unsetClickCatcher();
}

vitem.hideDownloadOptionsModal = function() {
	var box = document.getElementsByClassName('DownloadOptionsModal')[0];
	//Transition up
	box.className = "DownloadOptionsModal";
	//Stop click
	viewman.unsetClickCatcher();
}

var DownloadModalContentHtml = document.getElementById('DownloadModalContent').innerHTML;

vitem.showDownloadOptionsModal = function() {
	//Set inner back
    document.getElementById('DownloadModalContent').innerHTML = DownloadModalContentHtml;
    var continueFunction = function() {
        //Grab box
        var box = document.getElementsByClassName('DownloadOptionsModal')[0];
        //Transition up
        box.className = "DownloadOptionsModal DownloadOptionsModalActive";
        //Set click catcher
        viewman.setClickCatcher(99,function() {
            vitem.hideDownloadOptionsModal();
        });
    }
    //If we're signed in, change the add button.
    rpws.getTokenAsync(function(token) {
        //Token valid.
        var innerBox = document.getElementsByClassName('DownloadOptionsModalContentRpwsAd')[0];
		//Show other depending on if it's installed or not.
		if(vitem.runtime.added) {
			innerBox.innerHTML='<div class="DownloadOptionsModalContentRpwsAdText" style="margin-top:40px;margin-bottom:10px;">Signed into RPWS</div><div class="DownloadOptionsModalClassButton DownloadOptionsModalClassButtonRpws" onclick="vitem.runtime.downloadOptionsButton_RemoveFromLocker();">Remove From Watch</div>';
		} else {
			innerBox.innerHTML='<div class="DownloadOptionsModalContentRpwsAdText" style="margin-top:40px;margin-bottom:10px;">Signed into RPWS</div><div class="DownloadOptionsModalClassButton DownloadOptionsModalClassButtonRpws" onclick="vitem.runtime.downloadOptionsButton_AddToLocker();">Add To Watch</div>';
        }
        continueFunction();
    }, function() {
        //Invalid token. Don't show the download options for RPWS>
        continueFunction();
    });
	
}

