var soap = require("soap")
  , async = require("async")
  , https = require("https")
  , EdnsClient = require('./edns/client')
  , GtmClient = require('./gtm/client');


var Client = module.exorts = function(config){
  if(!("username" in config && "password" in config)){
    return null;
  } 

  this.username = config.username;
  this.password = config.password;
  this.host = config.host || "control.akamai.com";
  this.edns = new EdnsClient(this.username,this.password,config.edns);
  this.gtm = new GtmClinet(this.username,this.password,config.gtm);
}

Client.prototype.basicAuthHeader = function() {
  return {
    "Authorization": "Basic " + new Buffer(this.username + ':' + this.password).toString('base64')
  }
};


Client.connectGtm = function(cb){

}

Client.prototype.connectEdns = function(cb){
}