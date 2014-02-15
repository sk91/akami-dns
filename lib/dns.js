

var Edns = require("./edns")
  , Gtm = require("./gtm");

/**
 * Dns Class
 * @type {Function}
 */
var Dns = module.exports = function (domain,gtm,edns)
{
  if (typeof domain !== "string")
  {
    throw "String domain expected";
  }
  this.domain = domain;
  this.edns = edns;
  this.gtm =gtm;
};


Dns.prototype.getDomain = function ()
{
  return this.domain;
};

Dns.prototype.setDomain = function(domain){
  this.domain = domain;
}


Dns.prototype.getEdns = function ()
{
  return this.edns;
};

Dns.prototype.getGtm = function ()
{
  return this.gtm;
};


Dns.prototype.addRecord = function (record)
{
  this.edns.addRecord(record);
};

Dns.prototype.addDatacenter = function (dc){
  this.gtm.addDatacenter(dc);
}


Dns.prototype.equals = function (other)
{
  if (this.domain !== other.getDomain())
  {
    return false;
  }

  return this.diff(other) === false;
};











