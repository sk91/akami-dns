var utils = module.exports = {};

/**
 * Return attribute $name value of element $element.
 * Return null if undefined
 */
utils.attributeValue = function(name,element){
  var attribute = element.attr(name);

  return attribute?attribute.value():null;
}
/**
 * Return the value of element $name which is a child of $root.
 * If not found , return $default value
 */
utils.elementValue = function(root,name,default_val){
  var el = root.get(name);
  if(!el || typeof el.text !== "function"){
    return default_val;
  }
  return el.text();
}


/**
 * Convert array of $elements to xml with $el as root 
 */
utils.arrayToXml = function(el,elements){
  for(var ind in elements){
    if(elements.hasOwnProperty(ind)){
      elements[ind].toXml(el);
    }
  }
}



/**
 * Create element $name in $root if value if set. 
 */
utils.elementIfSet = function (root,name,value){
  if(value){
    root.ele(name,value);
  }
}


/**
 * Basic authentication header
 */
utils.basicAuthHeader = function(username,password) {
  return {
    "Authorization": "Basic " + new Buffer(username + ':' + password).toString('base64')
  };
}