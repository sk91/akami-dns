var _ = require("lodash")
  , xmlbuilder = require('xmlbuilder')
  , libxmljs = require('libxmljs')
  , utils = require('../utils');
/*******************************************************************************
 * Gtm Datacenter class
 * @type {Function}
 *******************************************************************************/
var DataCenter = module.exports = function(name, nickname) {
  this.name = name;
  this.nickname = nickname || name;
  this.editable = true;
  this.score_penalty = 0;
  this.country="N/A";
  this.city = "N/A";
  this.state_or_province = "N/A";
  this.latitude = "0.0";
  this.longitude = "0.0";
};

DataCenter.prototype.toXml = function(root) {
   var el = root ? root.ele("datacenter") : xmlbuilder.create("datacenter");

   el.att("name",this.name);
   el.ele("nickname",this.nickname);
   el.ele("editable",(this.editable)?"true":"false");
   el.ele('score-penalty',this.score_penalty);
   el.ele('city',this.city);
   el.ele('state-or-province',this.state_or_province);
   el.ele('country',this.country);
   el.ele('latitude',this.latitude);
   el.ele('longitude',this.longitude);

   return el.end({"pretty":true});
}

DataCenter.fromXml=function(xml){
  if(typeof xml === "string"){
    xml = libxmljs.parseXml(xml).root();
  }

  var root_name = xml.name();

  if(root_name !== "datacenter"){
    throw "Invalid element " + root_name + ", datacenter expected";
  }

  var name =  utils.attributeValue('name',xml)
    , dc = new DataCenter(name);

  dc.nickname = utils.elementValue(xml,'nickname',name);
  dc.editable = (utils.elementValue(xml,'editable',"true") === "true");
  dc.score_penalty = utils.elementValue(xml,'score-penalty',0);
  dc.country=utils.elementValue(xml,'country',"N/A");
  dc.city = utils.elementValue(xml,'city',"N/A");
  dc.state_or_province = utils.elementValue(xml,'state-or-province',"N/A");
  dc.latitude = utils.elementValue(xml,'latitude',"0.0");
  dc.longitude = utils.elementValue(xml,'longitude',"0.0");

  return dc;
}


