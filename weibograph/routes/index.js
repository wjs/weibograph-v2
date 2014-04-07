
/*
 * GET home page.
 */

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./db/weibograph.db');
var searchUserSQL = 'select uid, nick from user where uid = ? or nick like ? limit 50';


exports.index = function(req, res){
	res.render('index');
};

exports.search = function(req, res) {
	var keyword = req.query.keyword;
	var param = [keyword, '%'+keyword+'%'];

	db.all(searchUserSQL, param, function (err, records) {
		json_list = '[';
		if (records) {
			for (var i = 0; i < records.length; i++) {
				json_list += '{uid:"'+records[i].uid+'", nick:"'+records[i].nick+'"},';
			}
			json_list = json_list.length > 1 ? json_list.substr(0, json_list.length-1) : json_list;
		}
		json_list += ']';
    	res.send(JSON.stringify(json_list));
  	});
};