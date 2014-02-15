var _ = require("lodash")
  , xmlbuilder = require('xmlbuilder')
  , libxmljs = require('libxmljs')
  , utils = require('../utils')
  , DataCenter = require('./data-center');
/*******************************************************************************
 * Gtm - Cidr class
 * @type {Function}
 *******************************************************************************/
var CidrMap = module.exports = function(name, default_datacenter) {
  this.name = name;
  this.type = CidrMap.TYPE;
  this.default_datacenter;
  if (!this.setDefaultDatacenter(default_datacenter)) {
    return null;
  }
  this.cidrs = [];
};
CidrMap.TYPE = "cidrmapping";

/**
 * Set Default data center
 * @param DataCenter data_center
 * @returns {unresolved}
 */
CidrMap.prototype.setDefaultDatacenter = function(data_center) {
  if (!data_center instanceof DataCenter) {
    return null;
  }
  return this.default_datacenter = data_center;
}

/**
 * Add CIDR entry to the map
 * @param Cidr cidr
 * @returns Cidr
 */
CidrMap.prototype.addCidr = function(cidr) {
  if (!cidr instanceof Cidr) {
    return null;
  }
  this.cidrs.push(cidr);
  return cidr;
}

CidrMap.prototype.toXml = function(root) {
  var el = root ? root.ele("cidr-map") : xmlbuilder.create("cidr-map");

  el.att("name",this.name)
    .att('default-datacenter',this.default_datacenter.nickname);

  utils.arrayToXml(el,this.cidrs);

  return el.end({"pretty":true});
}

CidrMap.fromXml=function(xml,data){
  if(typeof xml === "string"){
    xml = libxmljs.parseXml(xml).root();
  }

  if(!data || !("gtm" in data)){
    throw "Invalid data, should be an object containing gtm";
  }
  var name = utils.attributeValue('name',xml)
    , default_dc = utils.attributeValue('default-datacenter',xml);

  default_dc = data.gtm.getDataCenter(default_dc);

  if(!default_dc){
    throw "Default data center not found";
  }

  var map = new CidrMap(name,default_dc)
    , cidrs = xml.find('cidr-map-to')
    , obj;

  for(var ind in cidrs){
    if(cidrs.hasOwnProperty(ind)){
      obj= Cidr.fromXml(cidrs[ind],data);
      map.addCidr(obj);
    }
  }

  return map;
}

/*******************************************************************************
 * Class Cidr --- represents one entry in the CIDR map
 ******************************************************************************/
var Cidr = CidrMap.Cidr = function(data_center, blocks) {
  this.data_center;
  this.blocks;

  if (!this.setDataCenter(data_center)) {
    return null;
  }
  this.setBlocks(blocks);
}
/**
 * Set data center
 * @param DataCenter data_center
 * @returns DataCenter
 */
Cidr.prototype.setDataCenter = function(data_center) {
  if (!data_center instanceof DataCenter) {
    return null;
  }
  return this.data_center = data_center;
}
/**
 * Set blocks (list of ips)
 * @param {Array|String} blocks
 * @returns {Array}
 */
Cidr.prototype.setBlocks = function(blocks) {
  if (typeof blocks === "string") {
    blocks = blocks.split(" ");
  }

  if (!Array.isArray(blocks)) {
    blocks = [];
  }
  this.blocks = blocks;
  return blocks;
}

Cidr.prototype.toXml = function(root) {
  var el = root ? root.ele("cidr-map-to") : xmlbuilder.create("cidr-map-to");

  el.att("name", this.data_center.nickname);
  el.ele("blocks",this.blocks.join(" "));

  return el.end({"pretty":true});
}

Cidr.fromXml=function(xml,data){
  if(typeof xml === "string"){
    xml = libxmljs.parseXml(xml).root();
  }

  if(!data || !('gtm' in data)){
     throw "Invalid data, should be an object containing gtm";
  }

  var name = utils.attributeValue('name',xml)
    , blocks = utils.elementValue(xml,'blocks','*')
    , dc = data.gtm.getDataCenter(name)
    , cidr;

  if(!dc){
    throw "Data center '" + name + "' not found";
  }

  cidr = new Cidr(dc,blocks);

  return cidr;
} 