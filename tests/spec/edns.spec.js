var Akamai = require("../../")
  , Edns = Akamai.Edns;



describe("Edns object",  function(){
  var edns;

  beforeEach(function(){
    edns = new Edns();
  });


  it('Should be able to add records', function(){
    expect(typeof edns.addRecord()).toBe('function') ;
  });


  it('Should have equals function', function(){
    expect(typeof edns.equals()).toBe('function') ;
  });


});
