var _ = require("lodash")
  , xmlbuilder = require('xmlbuilder')
  , libxmljs = require('libxmljs')
  , utils = require('../utils');
/*******************************************************************************
 * Gtm - Property class
 * @type {Function}
 ******************************************************************************/
var Property = module.exports = function(name, map) {
  this.name = name;
  this.map = map;
  this.cname = null;
  this.ttl = 300;
  this.load_monitoring_scores = false;
  this.load_monitoring_computed = false;
  this.failover_delay = 0;
  this.failback_delay = 0;
  this.persistent_assignment = false;
  this.assignments = [];
  this.liveness_tests = [];
}

Property.prototype.addAssignment = function(assignment){
  this.assignments.push(assignment);
  return this;
}

Property.prototype.addLivenessTest = function(test){
  this.liveness_tests.push(test);
  return this;
}

Property.prototype.toXml = function(root) {
  var el = root ? root.ele("property") : xmlbuilder.create("property");
  el.att('name',this.name);
  el.ele('map.type',this.map.type);

  utils.elementIfSet(el,'map.name',this.map.name);

  el.ele('ttl',this.ttl);
  el.ele('cname',this.cname);
  el.ele('load-monitoring.balance-by-download-scores',this.load_monitoring_scores?"true":"false");
  el.ele("load-monitoring.use-computed-targets",this.load_monitoring_computed?"true":false);

  el.ele('failover-delay',this.failover_delay);
  el.ele("failback-delay",this.failback_delay);
  el.ele('persistent-assignment',this.persistent_assignment?"true":"false");


  utils.arrayToXml(el,this.assignments);
  utils.arrayToXml(el,this.liveness_tests);
  

  return el.end({"pretty":true});
}

Property.fromXml=function(xml,data){
  if(typeof xml === "string"){
    xml = libxmljs.parseXml(xml).root();
  }

  var root_name = xml.name();

  if(root_name !== 'property'){
    throw "Invalid element " + root_name +" 'property expected ";
  }

  if(!data || !('gtm' in data)){
    throw "Invalid data passed, should be an object containing GTM object";
  }
  var name = utils.attributeValue('name',xml);

  var map_type = utils.elementValue(xml,"map.type",null)
    , map_name = utils.elementValue(xml,"map.name",null)
    , map = data.gtm.getMap(map_type,map_name);
  if(!map){
    throw "Invalid property, map not found. Name:" + map_name + ", Type:" + map_type;
  }

  var  property = new Property(name,map);

  property.ttl = utils.elementValue(xml,'ttl',300);
  property.cname = utils.elementValue(xml,'cname',null);
  property.load_monitoring_scores=utils.elementValue(xml,'load-monitoring.balance-by-download-scores',"false") === "true";
  property.load_monitoring_computed=utils.elementValue(xml,'load-monitoring.use-computed-targets',"false") === "true";
  property.failover_delay=utils.elementValue(xml,'failover-delay',0);
  property.failback_delay=utils.elementValue(xml,'failback-delay',0);
  property.persistent_assignment = utils.elementValue(xml,'persistent-assignment',"false")==="true";

  var assignments = xml.find("assignment")
    , liveness_tests = xml.find('liveness-test')
    , obj;

  for(var ind in assignments){
    if(! assignments.hasOwnProperty(ind)){
      continue;
    }
    obj = Assignment.fromXml(assignments[ind],data);
    property.addAssignment(obj);
  }

  for(var ind in liveness_tests){
    if(! liveness_tests.hasOwnProperty(ind)){
      continue;
    }
    obj = LivenessTest.fromXml(liveness_tests[ind],data);
    property.addLivenessTest(obj);
  }

  return property;
}

/*******************************************************************************
 * Property - Assignment class
 * @type {Function}
 ******************************************************************************/
var Assignment = Property.Assignment = function(data_center,status, traffic_weight, alternate_name , servers) {
  this.data_center = data_center;
  this.status = status;
  this.traffic_weight = traffic_weight;
  this.alternate_name = alternate_name;
  this.servers = servers;
};

Assignment.prototype.toXml = function(root) {
  var el = root ? root.ele("assignment") : xmlbuilder.create("assignment");
  el.att('name',this.data_center.nickname);
  el.ele('status',this.status);
  el.ele('traffic-weight',this.traffic_weight);
  utils.elementIfSet(el,'alternate-name',this.alternate_name);
  utils.elementIfSet(el,'servers',this.servers);

  return el.end({"pretty":true});
}


Assignment.fromXml=function(xml,data){
  if(typeof xml === "string"){
    xml = libxmljs.parseXml(xml).root();
  }

  var root_name = xml.name();

  if(root_name !== 'assignment'){
    throw "Invalid element " + root_name + ", expected assignment";
  }

  if(!data || !("gtm" in data)){
    throw "Invalid data, should contain gtm object";
  }

  var name = utils.attributeValue('name',xml)
    , dc = data.gtm.getDataCenter(name);
  if(!dc){
    throw "Datacenter " + name + " not found";
  }

  var status = utils.elementValue(xml,'status',"on")
    , traffic_weight = utils.elementValue(xml,'traffic-weight',1.0)
    , alternate_name = utils.elementValue(xml,'alternate-name',null)
    , servers = utils.elementValue(xml,'servers', null)
    , assignment = new Assignment(dc,status, traffic_weight, alternate_name , servers);

  return assignment;
}



/*******************************************************************************
 * LivenessTest - Property assignment class
 * @type {Function}
 ******************************************************************************/
var LivenessTest = Property.LivenessTest = function(name,protocol){
  this.name = name;
  this.protocol = protocol;

  this.interval = 60;
  this.timeout=25.0;
  this.port = 80;
  this.object = null;
  this.password = null;
  this.username = null;
  this.http_use_host_header = null;
  this.http_failure_codes = null;
  this.suppress_non_standard_port_warnigns = false;
};

LivenessTest.prototype.toXml = function(root) {
  var el = root ? root.ele("liveness-test") : xmlbuilder.create("liveness-test");
  el.att("name",this.name);

  el.ele('test.interval',this.interval);
  el.ele('test.timeout',this.timeout);
  el.ele('test.protocol',this.protocol);
  el.ele('test.port',this.port);
  el.ele('test.object',this.object);
  el.ele('test.password',this.password);
  el.ele('test.username',this.username);
  el.ele('test.http.use-host-header',this.http_use_host_header);
  el.ele('test.failures-codes',this.http_failure_codes);
  el.ele('test.suppress-non-standard-port-warnings',this.suppress_non_standard_port_warnings);

  return el.end({"pretty":true});
}


LivenessTest.fromXml=function(xml,data){
  if(typeof xml === "string"){
    xml = libxmljs.parseXml(xml).root();
  }
  var root_name = xml.name();

  if(root_name !== 'liveness-test'){
    throw "Invalid element " + root_name + ", expected assignment";
  }


  var name = utils.attributeValue('name',xml)
    , protocol =  utils.elementValue(xml,'test.protocol',"http")
    , test = new LivenessTest(name,protocol);

  test.interval = utils.elementValue(xml,'test.interval',"60");
  test.timeout = utils.elementValue(xml,'test.timeout',"http");
  test.port = utils.elementValue(xml,'test.port',"http");
  test.object = utils.elementValue(xml,'test.object',"http");
  test.password = utils.elementValue(xml,'test.password',"http");
  test.username = utils.elementValue(xml,'test.username',"http");
  test.http_use_host_header =utils.elementValue(xml,'test.http.use-host-header',"http");
  test.http_failure_codes = utils.elementValue(xml,'test.failures-codes',"http");
  test.suppress_non_standard_port_warnings = utils.elementValue(xml,'test.suppress-non-standard-port-warnings',"http");

  return test;
}

