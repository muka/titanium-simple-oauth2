module.exports = function(config) {
    
    var appConfig = require('titanium-simple-oauth2/config');

    function configure(config) {
        config = config || {};
        mergeDefaults(config, appConfig);
        return config;
    }

    config = configure(config);
    var core = require('titanium-simple-oauth2/core')(config);

    function mergeDefaults(o1, o2) {
        for (var p in o2) {
            try {
                if ( typeof o2[p] == 'object') {
                    o1[p] = mergeDefaults(o1[p], o2[p]);
                } else if ( typeof o1[p] == 'undefined') {
                    o1[p] = o2[p];
                }
            } catch(e) {
                o1[p] = o2[p];
            }
        }
        return o1;
    }

    return {
        'AuthCode' : require('titanium-simple-oauth2/client/auth-code')(config),
        'Password' : require('titanium-simple-oauth2/client/password')(config),
        'Client' : require('titanium-simple-oauth2/client/client')(config),
        'AccessToken' : require('titanium-simple-oauth2/client/access-token')(config)
    };
};