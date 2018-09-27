searchOptions = {};
searchOptions.category = {};
searchOptions.sort = {};
searchOptions.category.value = "";
searchOptions.sort.value = "POPULAR";
searchOptions.query = {};
searchOptions.query.value="";

searchOptions.offset = 0;
searchOptions.limit = 15;
searchOptions.type="watchapp";


function LoadSearchOptionsFromUrl() {
    //First, determine if we're using watchapps and what page.
    var split = location.pathname.split('/');
    if(split.length>=3) {
        searchOptions.type = split[1];
        searchOptions.type = searchOptions.type.substr(0,searchOptions.type.length-1);
        //Check if this is an app.
        if(searchOptions.type == "ap") {
            //Navigate to the app.
            searchOptions.type="watchapp";
            var appId = split[2];
            return appId;
        }
        //Determine the limit.
        searchOptions.limit = 15;
        if(searchOptions.type=="watchface") {
            searchOptions.limit = 39;
        }
        //Set the page.
        var page = parseInt(split[2]);
        if(isNaN(page)) {
            page = 1;
        }
        if(page <= 0) {
            page = 1;
        }
        page = page - 1;
        searchOptions.offset = page*searchOptions.limit;
    }
    //Now, parse the query requests.
    var parsed = shared.parseURLParams();
    if(parsed!=null) {
        if(parsed.sort != null) {
            searchOptions.sort.value = parsed.sort;
        }
        if(parsed.category != null) {
            searchOptions.category.value = parsed.category;
        }
        if(parsed.query != null) {
            searchOptions.query.value = parsed.query;
        }
    }
    return null;
}