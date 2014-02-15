var _ = require("lodash")
  , xmlbuilder = require('xmlbuilder')
  , libxmljs = require('libxmljs')
  , utils = require('../utils')
  , DataCenter = require('./data-center');
/********************************************************************************
 * Gtm - GeoMap class
 * @type {Function}
 *******************************************************************************/
var GeoMap = module.exports = function(name) {
  this.name = name;
  this.zones = [];
  this.type=GeoMap.TYPE;
};

GeoMap.TYPE = "geographic";

/**
 * Add zone to the map
 * @param {type} zone  
 * @returns {undefined}
 */
GeoMap.prototype.addZone = function(zone) {
  if (!zone instanceof Zone) {
    return null;
  }
  this.zones.push(zone);
  return zone;
}

GeoMap.prototype.toXml = function(root) {
  var el = root ? root.ele("geo-map") : xmlbuilder.create("geo-map");
  el.att("name",this.name);
  utils.arrayToXml(el,this.zones);
  return el.end({"pretty":true});
}
GeoMap.fromXml=function(xml,data){
  if(typeof xml === "string"){
    xml = libxmljs.parseXml(xml).root();
  }

  var name = utils.attributeValue('name',xml)
    , map = new GeoMap(name)
    , zones = xml.find('map-to')
    , zone;

  for(var ind in zones){
    if(zones.hasOwnProperty(ind)){
      zone = Zone.fromXml(zones[ind],data);
      map.addZone(zone);
    }
  }
  return map;
}

/**
 * Zone class
 * @param {type} data_center
 * @param {type} countries
 * @returns {unresolved}
 *******************************************************************************/
var Zone = GeoMap.Zone = function(data_center, countries) {
  this.data_center=data_center;
  this.setCountries(countries);

}



/**
 * Set countries (list of 2 letter country codes)
 * @param {type} countries
 * @returns {type}
 */
Zone.prototype.setCountries = function(countries) {
  if (typeof countries === "string") {
    countries = countries.split(" ");
  }

  if (!Array.isArray(countries)) {
    countries = ["*"];
  }
  this.countries = countries;

  return countries;
}


Zone.prototype.toXml = function(root,data) {
  var el = root ? root.ele("map-to") : xmlbuilder.create("map-to");

  el.att("name",this.data_center.nickname);
  el.ele("countries",this.countries.join(' '));

  return el.end({"pretty":true});
}

Zone.fromXml=function(xml,data){
  if(typeof xml === "string"){
    xml = libxmljs.parseXml(xml).root();
  }
  if(!data || !('gtm' in data)){
    throw "Invalid data passed, should be an object containing GTM object";
  }
  var name = utils.attributeValue('name',xml)
    , dc = data.gtm.getDataCenter(name)
    , countries = utils.elementValue(xml,'countries','*');

  if(!dc){
    throw "Could not find data center " + name;
  }
  return new Zone(dc,countries);
}