var util = require('util')
  , events = require('events')
  , utils = require('../utils')
  , soap = require('soap')
  , Gtm = require('./gtm');

var DEFAULT_GTM_URL = "https://control.akamai.com/webservices/services/PublishTrafficManagement?wsdl"
  , AKAMAI_DOMAIN_POSTFIX = ".akadns.net";


var Client = module.exports = function(username,password,url){
  events.EventEmitter.call(this);
  if(!username || typeof password !== 'string'){
    throw "Username and password must be defined";
  }
  this.username = username;
  this.password = password;

  this.url = url || DEFAULT_GTM_URL;
  this.connection = null;
} 
util.inherits(Client, events.EventEmitter);



/**
 * Creates web service connection
 */ 
Client.prototype.connect = function(cb,reset){
  reset = (reset === true)? true: false;
  if(this.connection && !reset){
    return cb(null,this);
  }

  var basic_auth = utils.basicAuthHeader(this.username,this.password);
  soap.createClient(this.url,{wsdl_headers:basic_auth},connected_cb.bind(this));

  function connected_cb(err,conn){
    if(err) return cb(err);
    conn.setSecurity(new soap.BasicAuthSecurity(this.username, this.password));
    this.connection = conn;
    return cb(null,this);
  }
}

/**
 * Use this method to compare an XML file representing a Traffic Management domain with the current configuration 
 * of this domain on the Akamai network. This method will not apply the changes but will only validate the domain.
 */
Client.prototype.compare = function(gtm,cb){
  var gtm_xml = new Buffer(gtm.toXml()).toString('base64');

  this.connection.upload({
    domainConfiguration:gtm_xml
  }, function(err,result){
    console.log(result);
  });
}

Client.prototype.validate = function(gtm,cb){
  var gtm_xml = new Buffer(gtm.toXml()).toString('base64');

  this.connection.upload({
    domainConfiguration:gtm_xml
  }, function(err,result){
    console.log(result);
  });
}
/**
 * Uploads gtm config.
 * if ignore_warnings is set to true,
 * will upload the config even if there are warnings.
 */
Client.prototype.upload = function(gtm,cb,ignore_warnings){
  ignore_warnings = (ignore_warnings === true)? true:false;

  var gtm_xml = new Buffer(gtm.toXml()).toString('base64');
  this.connection.upload({
    domainConfiguration:gtm_xml,
    ignoreWarnings:ignore_warnings
  }, function(err,result){
    console.log(result);
  });

}
/**
 * Callback should get array of strings representing all 
 * domain configured for the account
 */
Client.prototype.getDomainList = function(cb){
  this.connection.getDomainList(function(err,results){
    cb(results);
  });
}
/**
 * Downloads config for a particular domain
 */
Client.prototype.download = function(domain,cb){
  domain = domain+AKAMAI_DOMAIN_POSTFIX;
  this.connection.download({domain:domain},function(err,result){
    if(err){return cb(err);}
    if("fpdomaininfo" in result){
      return cb(null, Gtm.fromXml(result.fpdomaininfo));
    }
    return cb("Invalid data returned, no fpdomainingo");
  });
}

Client.prototype.getCountryList = function(cb){
  this.connection.getCountryList(function(err,result){
    console.log(result);
  })
}

Client.prototype.getDomainStatus = function(cb){
  this.connection.getDomainStatus(function(err,result){
    console.log(result);
  });
}


Client.prototype.getRemoteAgentIp = function(cb){
  this.connection.getDomainStatus(function(err,result){
    console.log(result);
  });
}



