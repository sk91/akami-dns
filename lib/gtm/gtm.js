var _ = require("lodash")
  , xmlbuilder = require('xmlbuilder')
  , libxmljs = require('libxmljs')
  , utils = require('../utils');

var Property = require("./property")
  , GeoMap = require('./geo-map')
  , DataCenter = require('./data-center')
  , CidrMap = require('./cidr-map')
  , FailoverMap = require('./failover-map')
  , PerformanceMap = require('./performance-map');
/*******************************************************************************
 * Gtm Class
 * @type {Function}
 *******************************************************************************/
var Gtm = module.exports = function(token) {
  if(!token){
    throw "Token is required";
  }
  this.token = token;
  this.data_centers = [];
  this.geo_maps = [];
  this.properties = [];
  this.cidr_maps = [];
  this.comment = "";
  this.date = null;
  this.email_notification=null;
  this.max_imbalance=10;
  this.load_monitoring_status="off";
};


/**
 * Add property
 * @param {Property} property
 * @returns {Property}
 */

Gtm.prototype.addProperty = function(property) {
  this.properties.push(property);
  return property;
}
/**
 * Add GEO map
 * @param {GeoMap} geo_map
 * @returns {GeoMap}
 */
Gtm.prototype.addGeoMap = function(geo_map) {
  this.geo_maps.push(geo_map);
  return geo_map;
}
/**
 * Add data center
 * @param {DataCenter} data_center
 * @returns {DataCenter}
 */
Gtm.prototype.addDataCenter = function(data_center) {
  this.data_centers.push(data_center);
  return data_center;
}
/**
 * Add CIDR map
 * @type {Function}
 * @param {CidrMap} cidr_map
 * @returns {undefined}
 */
Gtm.prototype.addCidrMap = function(cidr_map) {
  this.cidr_maps.push(cidr_map);
  return cidr_map;
}
/**
 * Equal function, returns true if the current object equals to the other
 * @param {Gtm} other
 * @returns {Boolean}
 */
Gtm.prototype.equals = function(other) {
  //TODO implement GTM Equals
  return true;
}

Gtm.prototype.getDataCenter = function(nickname){
  return _.find(this.data_centers,{"nickname":nickname});
}

Gtm.prototype.getMap = function(type,name){
  if(type === FailoverMap.TYPE){
    return new FailoverMap();
  }

  if(type === PerformanceMap.TYPE){
    return new PerformanceMap();
  }

  var search_array = null;
  if(type === CidrMap.TYPE){
    search_array = this.cidr_maps;
  }

  if(type === GeoMap.TYPE){
    search_array= this.geo_maps;
  }

  return (search_array)? _.find(search_array,{name:name}):null;
}

Gtm.prototype.toXml = function(root) {
  var el = root ? root.ele("configs") : xmlbuilder.create("configs")
    , change_note = el.ele('change-note')
    , domain = el.ele('edge-config').ele('domain');

  el.att('xmlns:xsi',"http://www.w3.org/2001/XMLSchema-instance")
    .att('version',"1.0")
    .att('xsi:schemaLocation',"https://control.akamai.com/schema/trafficManagement/v3/configs.xsd");

  change_note.att("comment",this.comment);
  utils.elementIfSet(change_note,'date',this.date);
  domain.ele("token",this.token);
  utils.elementIfSet(domain,'email-notification',this.email_notification);
  domain.ele("max-imbalance",this.max_imbalance);
  domain.ele("load-monitoring.status",this.load_monitoring_status);
  
  utils.arrayToXml(domain,this.data_centers);
  utils.arrayToXml(domain,this.geo_maps);
  utils.arrayToXml(domain,this.properties);
  utils.arrayToXml(domain,this.cidr_maps);

  return el.end({pretty:true});
}

Gtm.fromXml=function(xml,data){
  if(typeof xml === "string"){
    xml = libxmljs.parseXml(xml).root();
  }
  var root_name = xml.name();
    
  if(root_name!=='configs'){
    throw "Invalid element " + root_name + ", 'configs' expected.";
  }

  var change_note = xml.get('change-note')
    , edge_config = xml.get('edge-config');

  if(!change_note){
    throw "No change-not element";
  }

  if(!edge_config){
    throw "No edge-config element";
  }


  var domain = edge_config.get('domain');

  if(!domain){
    throw "No domain element";
  }

  var token = domain.get('token').text()
    , gtm = new Gtm(token);

  data = data || {};
  data["gtm"] = gtm;

  gtm.comment = utils.attributeValue('comment',change_note);
  gtm.date = utils.attributeValue('date', change_note);
  gtm.email_notification = utils.attributeValue('email-notification',domain);
  gtm.max_imbalance = utils.attributeValue('max-imbalance',domain);
  gtm.load_monitoring_status = utils.attributeValue('load-monitoring.status',domain);


  var obj;

  var datacenters = domain.find('datacenter')
    , geo_maps = domain.find('geo-map')
    , properties = domain.find('property')
    , cidr_maps = domain.find('cidr-map');

  for(var ind in datacenters){
    if(!datacenters.hasOwnProperty(ind)){
      continue;
    }
   
    obj = DataCenter.fromXml(datacenters[ind],data);
    gtm.addDataCenter(obj);  
  }

  for(var ind in geo_maps){
    if(!geo_maps.hasOwnProperty(ind)){
      continue;
    }
   
    obj = GeoMap.fromXml(geo_maps[ind],data);
    gtm.addGeoMap(obj);  
  }

  for(var ind in cidr_maps){
    if(!cidr_maps.hasOwnProperty(ind)){
      continue;
    }
   
    obj = CidrMap.fromXml(cidr_maps[ind],data);
    gtm.addCidrMap(obj);  
  }

  for(var ind in properties){
    if(!properties.hasOwnProperty(ind)){
      continue;
    }
   
    obj = Property.fromXml(properties[ind],data);
    gtm.addProperty(obj);  
  }



  return gtm;
}






Gtm.Property = Property;
Gtm.GeoMap = GeoMap;
Gtm.DataCenter = DataCenter;
Gtm.CidrMap = CidrMap;
Gtm.FailoverMap = FailoverMap;
Gtm.PerformanceMap = PerformanceMap;
