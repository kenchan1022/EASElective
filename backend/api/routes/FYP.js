var express = require('express');
var router = express.Router();

/* GET FYP listing. */
router.get('/Course', function(req, res, next) {

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
router.get('/Course/:id', function(req, res, next) {
	console.log(req.params.id);
	var sqlCommend = "SELECT * from Course WHERE CourseCode = '" + req.params.id +"'";
	connection.query(sqlCommend, function (error, results, fields) {
	  	if(error){
	  		res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
	  		//If there is error, we send the error in the error section with 500 status
	  	} else {
  			res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
  			//If there is no error, all is good and response is 200OK.
	  	}
  	});
});

router.get('/CourseTeacher/:id', function(req, res, next) {
	console.log(req.params.id);
    var sqlCommend = "SELECT f.name FROM CourseFeature cf INNER JOIN Feature f ON f.FeatureID = cf.FeatureID WHERE cf.CourseCode = '" + req.params.id + " 'AND f.Type = 'Lecturer' OR f.Type = 'Tutor';";
	connection.query(sqlCommend, function (error, results, fields) {
	  	if(error){
	  		res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
	  		//If there is error, we send the error in the error section with 500 status
	  	} else {
  			res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
  			//If there is no error, all is good and response is 200OK.
	  	}
  	});
});

router.get('/CFComment/:id/:id2', function(req, res, next) {
	console.log(req.params.id);
	console.log(req.params.id2);
        var sqlCommend = "SELECT * FROM CFComment WHERE Course_FeatureCourseCode = '" + req.params.id +"' AND Course_FeatureFeatureID = '"+ req.params.id2 + "'";
	connection.query(sqlCommend, function (error, results, fields) {
	  	if(error){
	  		res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
	  		//If there is error, we send the error in the error section with 500 status
	  	} else {
  			res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
  			//If there is no error, all is good and response is 200OK.
	  	}
  	});
});

router.get('/FindFeature/:id/:id2', function(req, res, next) {
	console.log(req.params.id);
	console.log(req.params.id2);
        var sqlCommend = "SELECT f.Name FROM CourseFeature cf INNER JOIN Feature f ON f.FeatureID = cf.FeatureID WHERE cf.CourseCode = '" + req.params.id + " 'AND f.Type= '"+ req.params.id2 + "' ;";
	connection.query(sqlCommend, function (error, results, fields) {
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
