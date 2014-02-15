var Akamai = require("../../")
  , Gtm = Akamai.Gtm;



describe("GTM object", function(){
  var gtm;

  beforeEach(function(){
    gtm = new Gtm();
  })

  it('Should be able to add property',function(){
    expect(typeof gtm.addProperty).toBe('function');
  });

  it("Should be able to add CIDR map", function(){
    expect(typeof gtm.addCidr).toBe('function');
  });

  it("Should be able to add GEO map", function(){
    expect(typeof gtm.addGeo).toBe('function');
  });

  it("Should be able to add datacenter", function(){
    expect(typeof gtm.addDataCenter).toBe('function');
  });

  it("Should be able to determine equal objects", function(){
    expect(typeof gtm.equals).toBe('function');
  });

});
