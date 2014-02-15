var Gtm = require("../../../lib/gtm")
  , async = require('async')
  , Client = require("../../../lib/gtm/client");

var DEFAULT_GTM_URL = "https://control.akamai.com/webservices/services/PublishTrafficManagement?wsdl"
  , AKAMAI_USERNAME = "username"
  , AKAMAI_PASSWORD = "password";


describe("Gtm client", function(){
  var client = null;

  beforeEach(function(){
    client = new Client(AKAMAI_USERNAME,AKAMAI_PASSWORD);
  });

  it("Should  instantiate", function(){
    expect(function(){new Client()}).toThrow();
    expect(function(){new Client("max")}).toThrow();
    expect(function(){new Client("max","")}).not.toThrow();
    expect(function(){new Client("max","pass")}).not.toThrow();

    var client = new Client('max', "pass")
      , test_url = "http://google.com";

    expect(client.url).toEqual(DEFAULT_GTM_URL);

    client = new Client("max","pass",test_url);

    expect(client.url).toEqual(test_url);
  });

  it("Should connect", function(){
    var cl1,conn1,conn2,conn3,ended = false;

    runs(function(){
      async.series([
        function(cb){
          client.connect(function(err,client){
            conn1 = client.connection;
            cl1 = client;
            cb();
          });
        },
        function(cb){
          client.connect(function(err,client){
            conn2 = client.connection;
            cb();
          });
        },
        function(cb){
          client.connect(function(err,client){
            conn3=client.connection;
            ended = true;
            cb();
          },true);
        }
      ]);
    });

    waitsFor(function(){
      return ended;
    });

    runs(function(){
      expect(cl1).toBe(client);
      expect(conn1).toBe(conn2);
      expect(conn1).not.toBe(conn3);
    });

  });


  it("Should download config", function(){
    var gtm = null
      , done = false;

    runs(function(){
      client.connect(function(err,client){
        client.download("test3-performance",function(err,result){
          if(err){
            done = true;
            return console.log(err);
          }
          gtm = result;
          done = true;
        });
      });
    });

    waitsFor(function(){
      return done;
    });

    runs(function(){
      expect(gtm instanceof Gtm).toBeTruthy(); 
    });

  });
});