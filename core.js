var DEBUG = true;
DEBUG = false;

var d = function(m) { DEBUG && console.debug(m) };

module.exports = function(config) {

    DEBUG = config.debug || DEBUG;

    var request = require('./lib/request');
    var errors = require("./error")();

    // High level method to call API
    function api(method, path, params, callback) {

        if (!callback || typeof (callback) !== 'function') {
            throw new Error('Callback not provided on API call');
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
        if (method !== 'GET')
            options.form = params;
        if (method === 'GET')
            options.qs = params;

        // Enable the system to send authorization params in the body (for example github does not require to be in the header)
        if (method !== 'GET' && options.form && (!params.password || params.useCredentials)) {
            options.form.client_id = config.clientID;
            options.form[config.clientSecretParameterName] = config.clientSecret;
        }

        d('OAuth2: Sending request');
        d( method + ' ' + url);
        d(params);

        request(options, callback);
    };

    // Extract the data from the request response
    function data(error, response, body, callback) {

        if (error) {

            d('OAuth2 request error')
            d(error);

            callback(error, response, body);
            return false;
            // throw new Error(estr);
        }

        try {
            body = JSON.parse(body);
        } catch(e) {
            /* The OAuth2 server does not return a valid JSON'); */
            console.error("Cannot parse auth response!");
        }

        d('OAuth2: checking response');
        d(body);

        if (response.statusCode >= 400) {
            return callback(new errors.HTTPError(response.statusCode), null);
        }

        callback(error, body);
    };

    function isEmpty(ob) {
        return !ob || !Object.keys(ob).length;
    };

    return {
        'call' : call,
        'data' : data,
        'api' : api,
    };
};
