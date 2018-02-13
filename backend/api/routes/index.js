var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
		console.log(req);
		console.log(req);
//		console.log(next);		
  		res.render('index', { title: 'Express' });
});

module.exports = router;
