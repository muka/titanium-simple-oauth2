//
// ### Wrapper for the Access Token object
//
module.exports = function(config) {

  var core  = require('titanium-simple-oauth2/core')(config);
  //require('titanium-simple-oauth2/lib/date-utils');

  //
  // ### Creates an OAuth2.AccessToken instance.
  //
  // * `token` - An object containing the token object returned from the OAuth2 server.
  //
  function create(token) {
    this.token = token;
    this.token.expires_at = (new Date).getTime() + (token.expires_in * 1000);
    return this;
  }

  //
  // ### Check if the access token is expired or not.
  //
  function expired() {
    return (new Date >= this.token.expires_at ) ? true : false;
  }

  //
  // ### Refresh the access token
  //
  // * `callback` - The callback function returning the results.
  // An error object is passed as first argument and the new OAuth2.AccessToken
  // as last.
  //
  function refresh(callback) {
    var params = { grant_type: 'refresh_token', refresh_token: this.token.refresh_token };
    var that = this;
    core.api('POST', config.tokenPath, params, function(error, result){
      if (result) { result = that.create(result); }
      callback(error, result);
    });
  }

  return {
    'create' : create,
    'token'  : this.token,
    'expired': expired,
    'refresh': refresh
  };
};
