var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/:id/:id2', function(req, res, next) {
	console.log(req.params.id);
	console.log(req.params.id2);
	connection.query('SELECT * from Course', function (error, results, fields) {
	  	if(error){
	  		res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
	  		//If there is error, we send the error in the error section with 500 status
	  	} else {
  			res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
  			//If there is no error, all is good and response is 200OK.
	  	}
  	});
});
router.get('/:id', function(req, res, next) {
	console.log(req.params.id);

	connection.query('SELECT * from Course', function (error, results, fields) {
	  	if(error){
	  		res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
	  		//If there is error, we send the error in the error section with 500 status
	  	} else {
  			res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
  			//If there is no error, all is good and response is 200OK.
	  	}
  	});
});
module.exports = router;
