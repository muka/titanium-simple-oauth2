module.exports = function(options, callback) {
    
    var qs = require('simple-oauth2/lib/querystring');
    var url = options.uri;
    
    if(options.method === 'GET' && options.qs) {
        url += '?' + qs.stringify(options.qs);
    }
    
    var client = Ti.Network.createHTTPClient({
        // function called when the response data is available
        onload : function(response) {
            callback(false, response, response.source.responseText, callback);
        },
        // function called when an error occurs, including a timeout
        onerror : function(e) {
            callback(e, false);
        },
        timeout : options.timeout || 5000 // in milliseconds
    });

    // Prepare the connection.
    client.open(options.method, url);    
    
    if(options.header) {
        for(var h in options.header) {
            xhr.setRequestHeader(h, options.header[h]);    
        }
    }

    var data = null;
    if(options.method === 'POST') {
        data = qs.stringify(options.form);        
    }

    // Send the request.
    client.send(data);

}; 