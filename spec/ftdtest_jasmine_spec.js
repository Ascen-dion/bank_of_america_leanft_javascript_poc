var LFT = require("leanft");
var SDK = LFT.SDK;
var expect = require("leanft/expect");
var whenDone = LFT.whenDone;
  

describe("FTDTest",function(){
	// set the default Jasmine time out
	jasmine : jasmine.DEFAULT_TIMEOUT_INTERVAL = 30 * 1000;

	beforeAll(function(done){
		LFT.init(); 
		 whenDone(done);
	});
	
	beforeEach(function(done){
		LFT.beforeTest();        
		whenDone(done);
	});

	it("Test",function(done){
		//Add steps here
		
		whenDone(done);
	});

	afterEach(function(done){
		LFT.afterTest();
		whenDone(done);
	});

	afterAll(function(done){
		LFT.cleanup();
		whenDone(done);
	});
});