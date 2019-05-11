'use strict';
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    console.log('test');
    res.render('../views/index.html', { title: 'Drachenbingo' });
});

module.exports = router;