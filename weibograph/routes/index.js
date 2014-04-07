var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./db/weibograph.db');

var search_user_sql = 'select uid, nick from user where uid = ? or nick like ? limit 50';
var query_user_sql = 'select * from user where uid = ?';
var get_db_follows_sql = 'select uid, nick, follows, fans from user where uid in (select target from relation where source = ?)';


exports.index = function(req, res){
	res.render('index');
};

exports.search = function(req, res) {
	var keyword = req.query.keyword;
	var param = [keyword, '%'+keyword+'%'];

	db.all(search_user_sql, param, function (err, rows) {
		var json_list = '[';
		if (rows && rows.length > 0) {
			for (var i = 0; i < rows.length; i++) {
				json_list += '{uid:"'+rows[i].uid+'", nick:"'+rows[i].nick+'"},';
			}
			json_list = json_list.substr(0, json_list.length-1);
		}
		json_list += ']';
    	res.send(JSON.stringify(json_list));
  	});
};

exports.graph = function(req, res) {
	var param = req.query.uid;

	db.all(query_user_sql, param, function (err, rows) {
		var nodes = '"nodes":[',
			links = '"links":[',
			error_msg = '{"nodes":[], "links":[]}';

		if (err) {
			res.send(error_msg);
		}

		if (rows && rows.length > 0) {
			nodes += '{"uid":' + rows[0].uid + ', "nick":"' + rows[0].nick + '", "follows":' + rows[0].follows + ', "fans":' + rows[0].fans + '}';

			db.all(get_db_follows_sql, param, function (error, records) {
				if (error) {
					res.send(error_msg);
				}

				if (records && records.length > 0) {
					for (var i = 0; i < records.length; i++) {
						nodes += ',{"uid":' + records[i].uid + ', "nick":"' + records[i].nick + '", "follows":' + records[i].follows + ', "fans":' + records[i].fans + '}';
						links += '{"source":' + param + ',"target":' + records[i].uid + '},';
					}
					links = links.substr(0, links.length-1);
				}
				nodes += ']';
				links += ']';
				res.send('{' + nodes + ', ' + links + '}');
			});
		} else {
			res.send(error_msg);
		}
	});
};