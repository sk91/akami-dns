var soap = require("soap")
  , async = require("async")
  , https = require("https")
  , Gtm = require("./gtm")
  , Edns = require('./edns')
  , Dns = require('./dns');

var Client = module.exports = function(username,password,host,akamai_edns_rest_path,akamai_edns_soap_url,akamai_gtm_url){
  this.username = username;
  this.password = password;
  this.host = host || "control.akamai.com";
  this.akamai_edns_rest_path = akamai_edns_rest_path || "/originservices/svcs/edns/p/v1/zones/";
  this.akamai_edns_soap_url = akamai_edns_soap_url || "https://control.akamai.com/webservices/services/EnhancedDNS?wsdl";
  this.akamai_gtm_url = akamai_gtm_url || "https://control.akamai.com/webservices/services/PublishTrafficManagement?wsdl";
  this.gtm_connection = this.edns_connection = null;
  this.dns = null;
}


Client.prototype.connect = function(cb) {
  

  cb = cb || default_cb;

  async.parallel([
    this.connectGtmSoap.bind(this),
    this.connectEdnsSoap.bind(this)
    ],cb);
};


Client.prototype.connectGtmSoap = function(cb){
  var self =this;

  soap.createClient(this.akamai_gtm_url, {
    wsdl_headers: this.basicAuthHeader()
  }, soap_client_cb.bind(this));
  
  function soap_client_cb(err,client){
    if(err) cb(err);
    this.gtm_connection=client;
    client.setSecurity(new soap.BasicAuthSecurity(self.username, self.password));

    cb(null,client);
  }
}


Client.prototype.connectEdnsSoap = function(cb){

  soap.createClient(this.akamai_edns_soap_url, {
    wsdl_headers: this.basicAuthHeader()
  }, soap_client_cb.bind(this));
  
  function soap_client_cb(err,client){
    if(err) cb(err);
    this.edns_connection=client;
    cb(null);
  }
}

Client.prototype.basicAuthHeader = function() {
  return {
    "Authorization": "Basic " + new Buffer(this.username + ':' + this.password).toString('base64')
  }
};

Client.prototype.loadDns = function(domain,cb){

  var self = this;

  async.parallel({
    edns:function(callback){
      self.loadEdnsZone(domain,function(err,edns){
          if(err){return callback(err)}
          callback(null,edns);
      });
    },
    gtm:function(callback){
      self.loadGtmZone(domain,function(err,gtm){
        if(err){return callback(err);}
        callback(null,gtm);
      });
    }
  },dns_cb.bind(this));

  function dns_cb(err,results){
    if(err){return null}
    this.dns = new Dns(domain,results.gtm,results.edns);
    cb(null,this.dns);
  };

};

Client.prototype.loadEdnsZone = function(domain,cb){
  var config = {
    host : this.host,
    path : this.akamai_edns_rest_path+ domain +"/",
    headers: this.basicAuthHeader()
  };
  var req = https.request(config,function(res){
    var data ="";
    if(res.statusCode!==200){
      return req.emit("error","Failed to fetch object on the server ("+res.statusCode+")");
    } 
    res.on('data', function(d) {
      data += d;
    });

    res.on('end',function(e){
      var edns = Edns.fromXml(data);
      return cb(null,edns);
    });

  });
  req.end();

  req.on("error",function(e){
    return cb(e);
  });





}

Client.prototype.loadGtmZone = function(domain,cb){
  this.gtm_connection.download({domain:domain+".akadns.net"},function(err,result){
    if(err) return cb(err);
    var gtm = Gtm.fromXml(result['fpdomaininfo']);
    cb(null,gtm);
  });
}

Client.prototype.downloadGtmDomains = function(domain,cb){

};

Client.prototype.downloadEdnsDomains = function(domain,cb){

};


Client.prototype.uploadEdnsConfig  = function(edns,cb){
};

Client.prototype.uploadGtmConfig = function(gtm,cb) {
  
};

Client.prototype.uploadConfig = function(dns,cb) {
      
};




function default_cb(err){
  if(err) throw err;
}
