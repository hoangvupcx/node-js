var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pages/dashboard/index', { title: 'HomePage' });
});


module.exports = router;
