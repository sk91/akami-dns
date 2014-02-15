var _ = require("lodash")
  , xmlbuilder = require('xmlbuilder')
  , libxmljs = require('libxmljs')
  , utils = require('../utils');
/****************************************************************************
 * Edns Class
 * @type {Function}
 ****************************************************************************/
var Edns = module.exports = function(token, id, instance, name, publisher, time, version) {
  this.token = token;
  this.id = id;
  this.instance = instance;
  this.name = name;
  this.publisher = publisher;
  this.time = time;
  this.version = version;
  this.records = [];
  this.soa = null;
};

/**
 *
 */

Edns.prototype.setToken = function(token) {
  this.token = token;
}


/**
 *
 * @param {type} record
 * @returns {Edns.prototype}
 */
Edns.prototype.addRecord = function(record) {
  if(record.type === "soa"){
    this.soa = record;
  }else{
    this.records.push(record);
  }
  return this;
};

Edns.prototype.equals = function(other) {
  var other_records = other.getRecords();

  if (other_records.length != this.records.length) {
    return false;
  }

  for (var i = 0, length = this.records.length; i < length; i++) {
    if (!this.records[i].equals(other_records[i])) {
      return false;
    }
  }
  return true;
};

Edns.prototype.getRecords = function() {
  return this.records;
};

Edns.prototype.bumpSoaSerial = function(){
  throw "Not implemented";
}

Edns.prototype.toXml = function(root) {

  var edns = root ? root.ele("zone_configuration") : xmlbuilder.create("zone_configuration")
    , zone = edns.ele('zone');

  edns.att('token', this.token);

  zone.att('id', this.id)
    .att('instance', this.instance)
    .att('name', this.name)
    .att('publisher', this.publisher)
    .att('time', this.time)
    .att('version', this.version);

  utils.arrayToXml(zone,this.records);

  if(this.soa){
    this.soa.toXml(zone);
  }
  return edns.end({pretty:true});
}

Edns.fromXml=function(xml){
  if(typeof xml === "string"){
    xml = libxmljs.parseXml(xml).root();
  }

  var root_name = xml.name()
    , zone = xml.get('zone');

  if(root_name!=="zone_configuration"){
    throw "Invalid element " + root_name + " zone_configuration expected";
  }

  if(!zone){
    throw "No zone element found";
  }
  
  var token = utils.attributeValue('token',xml)
    , id = utils.attributeValue('id',zone)
    , instance= utils.attributeValue('instance',zone)
    , name = utils.attributeValue('name',zone)
    , publisher = utils.attributeValue('publisher',zone)
    , time = utils.attributeValue('time',zone)
    , version = utils.attributeValue('version',zone);

  if(token === null){
     throw "No token provided";
  }
  if(name === null){
    throw "No zone name provided";
  }

  var edns = new Edns(token, id, instance, name, publisher, time, version)
    , zone_children = zone.childNodes()
    , child_xml;

  for(var child in zone_children){
    child_xml = zone_children[child];
    
    if(typeof child_xml.name === "function" && Record.isRecord(child_xml.name())){
      edns.addRecord(Record.fromXml(child_xml));
    }
  }

  return edns;
}


/****************************************************************************
 * Record Object
 * @type {Function}
 ****************************************************************************/
var Record = Edns.Record = function(type, attributes) {
  if (typeof type !== 'string') {
    throw "record type required";
  }
  this.type = type;

  attributes = attributes || {}

  this.addAttributes(attributes);
};


Record.prototype.addAttributes = function(attributes) {
  attributes = attributes || {};
  delete(attributes.type);
  _.merge(this, attributes);
  return this;
}

Record.prototype.removeAllAttributes = function() {
  var type = this.type;
  for (var attribute in this) {
    if (this.hasOwnProperty(attribute)) {
      delete this[attribute];
    }
  }
  this.type = type;
}

Record.prototype.toXml = function(root){
  var el = root ? root.ele(this.type) : xmlbuilder.create(this.type);
  
  for (var attribute in this) {
    if (this.hasOwnProperty(attribute) && attribute !== 'type') {
      el.att(attribute,this[attribute]);
    }
  }
  return el.end({pretty:true});
}

Record.fromXml=function(xml){
  if(typeof xml === "string"){
    xml = libxmljs.parseXml(xml).root();
  }

  var record_type = xml.name();

  if(!Record.isRecord(record_type)){
    throw "Invalid record type " + record_type;
  }
  var xml_attrs = xml.attrs()
    , attrs = {};


  for(var ind in xml_attrs){
    var attr = xml_attrs[ind];
    attrs[attr.name()]=attr.value();
  }

  var record = new Record(record_type,attrs);

  return record;
}

Record.isRecord = function(record){
  return _.contains(Record.RECORD_TYPES,record.toLowerCase());
}

Record.RECORD_TYPES=["a", "aaaa", "soa", "ns", "mx", "txt", "cname", "dname", "ptr", 'spf', 'srv'];







