
var Akamai = module.exports = function(config){
  this.config = config;
};


Akamai.prototype.createClient = function(){

}


Akamai.Edns = require("./edns");
Akamai.Gtm = require("./gtm");
Akamai.Client = require("./client");
Akamai.Dns = require('./dns');
Akamai.Client = require('./client');



