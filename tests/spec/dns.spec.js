var Akamai = require("../../")
  , Dns = Akamai.Dns;

describe("Akamai dns", function ()
{
  var akamai;

  beforeEach(function ()
  {
    akamai = new Dns("some_domain");
  })

  it("Should require domain on instatiation", function ()
  {
    var wrong_creation = function ()
    {
      new Dns();
    };
    var right_creation = function ()
    {
      new Dns('some_domain');
    }

    expect(wrong_creation).toThrow();
    expect(right_creation).not.toThrow();
  });


  it("Should have a hostname", function ()
  {
    expect(akamai.getDomain()).toEqual("some_domain");
    akamai.setDomain("hello");
    expect(akamai.getDomain()).toEqual("hello");
  });

  it("Should have an EDNS object", function ()
  {
    expect(akamai.getEdns() instanceof Akamai.Edns).toBeTruthy();
  });


  it("Should have GTM object", function ()
  {
    expect(akamai.getGtm() instanceof Akamai.Gtm).toBeTruthy();
  });

  it("Should be able to add records", function ()
  {
    expect(typeof akamai.addRecord).toBe('function');
  });


  it("Given a second object, it should detect what components differ", function ()
  {
    expect(typeof akamai.diff).toBe('function');

    var other = new Dns("other");

    expect(akamai.diff(other)).toEqual({edns: false, gtm: false});

    other.addRecord({ends: {hi: ";)"}});

    expect(akami.diff(other)).toEqual({edns: true, gtm: false});

  });


  it("Should be able to determine equal objects", function ()
  {
    expect(typeof akamai.equals).toBe('function');
    var other = new Dns("some_domain");

    expect(akamai.equals(other)).toBeTruthy();

    other.setDomain("hello");

    expect(akamai.equals(other)).toBeFalsy();

    other.setDomain("some_domain");

    other.addRecord({ends: {hi: ";)"}});

    expect(akamai.equals(other)).toBeFalsy();

    akamai.addRecord({ends: {hi: ";)"}})

    expect(akamai.equals(other)).toBeTruthy();
  });


})