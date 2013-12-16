module.exports = function(config) {

    var request = require('./lib/request');
    var errors = require("./error")();

    // High level method to call API
    function api(method, path, params, callback) {

        if (!callback || typeof (callback) !== 'function') {
            throw new Error('Callback not provided on API call');
        }

        if(config.debug) {
            Ti.API.debug('OAuth2 Node Request');
        }

        // tishadow hack
        var url = config.site + (path.substr(0,1) === '/' ? path : '/'+ path);

        call(method, url, params, function(error, response, body) {
            data(error, response, body, callback);
        });
    };

    // Make the HTTP request
    function call(method, url, params, callback) {

        var options = {
            uri : url,
            method : method
        };

        if (!config.clientID || !config.clientSecret || !config.site)
            throw new Error('Configuration missing. You need to specify the client id, the client secret and the oauth2 server');

        if (config.useBasicAuthorizationHeader && config.clientID)
            options.headers = {
                'Authorization' : 'Basic ' + Ti.Utils.base64encode(config.clientID + ':' + config.clientSecret)
            };
        else
            options.headers = {};

        if (isEmpty(params))
            params = null;
        if (method != 'GET')
            options.form = params;
        if (method == 'GET')
            options.qs = params;

        // Enable the system to send authorization params in the body (for example github does not require to be in the header)
        if (method != 'GET' && options.form && (!params.password || params.useCredentials)) {
            options.form.client_id = config.clientID;
            options.form[config.clientSecretParameterName] = config.clientSecret;
        }

        if(config.debug) {
            Ti.API.debug('Simple OAuth2: Making the HTTP request');
            console.log(options);
        }

        request(options, callback);
    };

    // Extract the data from the request response
    function data(error, response, body, callback) {

        if (error) {

            var estr = 'Simple OAuth2: something went wrong during the request';
            Ti.API.error(estr);
            if(error && config.debug) {
                console.log(error);
            }

            callback(error, response, body);
            return false;
            // throw new Error(estr);
        }

        if(config.debug) {
            Ti.API.debug('Simple OAuth2: checking response body');
            console.log(body);
        }

        try {
            body = JSON.parse(body);
        } catch(e) {
            /* The OAuth2 server does not return a valid JSON'); */
        }

        if (response.statusCode >= 400) {
            return callback(new errors.HTTPError(response.statusCode), null);
        }

        callback(error, body);
    };

    function isEmpty(ob) {
        for (var i in ob) {
            return false;
        }
        return true;
    };

    return {
        'call' : call,
        'data' : data,
        'api' : api,
    };
};
