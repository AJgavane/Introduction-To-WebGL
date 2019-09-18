/* utility functions */

/*
 * Parse the input json file url
 */
function getJSONFile(url,descr)
{
    try {
        if ((typeof(url) !== "string") || (typeof(descr) !== "string"))
            throw "getJSONFile: parameter not a string";
        else {
            var http_request = new XMLHttpRequest(); // a new http request
            http_request.open("GET",url,false); // init the request
            http_request.send(null); // send the request
            var startTime = Date.now();
            while ((http_request.status !== 200) && (http_request.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now()-startTime) > 3000)
                    break;
            } // until its loaded or we time out after three seconds
            if ((http_request.status !== 200) || (http_request.readyState !== XMLHttpRequest.DONE))
                throw "Unable to open "+descr+" file!";
            else
                return JSON.parse(http_request.response); 
        } // end if good params
    } // end try    
    
    catch(e) {
        console.log(e);
        return(String.null);
    }
}