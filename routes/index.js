'use strict';
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index.html', { title: 'Drachenbingo' });
});

module.exports = router;