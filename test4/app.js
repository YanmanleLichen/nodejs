var mqtt = require('mqtt');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({
	extended: false
});

var mysql = require('mysql');

var data = {
	"sln": "/",
	"li": -1,
	"state": -1,
	"time": "1999-10-20 00:00:00"
};
var json_data = JSON.stringify(data);
var obj = JSON.parse(json_data);
app.use(express.static('views'));
app.set('views', './views')
app.set('view engine', 'html');

var url = "mqtt://" + '115.28.108.146' + ":" + '1883'
var options = {
	clientId: 'fdb76dfa0f8141d187092f89e687a57b'
};
var client = mqtt.connect(url, options);

client.subscribe("sys/cloud/002200222037");
client.on('message', function (topic, message) {
	if (message != null) {
		json_data = message;
		obj = JSON.parse(json_data);
	}
});

app.get("/", function (req, res) {
	res.redirect('/login.html');
});

var old_time1 = "1999-10-20 00:00:00";
var old_time2 = "1999-10-20 00:00:00";
var old_time3 = "1999-10-20 00:00:00";
app.get("/yml_get", function (req, res) {
	if (obj.state != null && obj.state != -1 && obj.time != old_time1) {
		var connection = mysql.createConnection({
			host: 'localhost',
			user: 'root',
			password: '',
			port: '3306',
			database: 'node_js_test'
		});
		var sql = "";
		sql = "insert into light(sln, li, state, time) values('" +
			obj.sln + "', '" + obj.li + "', '" + obj.state + "', '" + obj.time + "')";
		console.log("get: " + sql);
		connection.connect();
		connection.query(sql, function (err, result) {
			if (err) {
				console.log('[INSERT ERROR] - ', err.message);
				return;
			}
			console.log('--------------------------INSERT----------------------------');
			console.log('INSERT ID:', result);
			console.log('-----------------------------------------------------------------\n\n');
		});
		connection.end();
		old_time1 = obj.time;
	}
	res.end(json_data);
});

app.get("/yml_open", function (req, res) {
	console.log("yml_open");
	var open_time = obj.time;
	var new_open_time = dateAdd(open_time, 1);
	var open = {
		"sln": "002200222037",
		"li": obj.li,
		"state": 1,
		"time": new_open_time
	};
	var open_json = JSON.stringify(open);
	console.log(open_json);
	console.log(open.time);
	if (open.li != -1 && open.li != null && open.time != old_time2) {
		var connection = mysql.createConnection({
			host: 'localhost',
			user: 'root',
			password: '',
			port: '3306',
			database: 'node_js_test'
		});
		var sql = "";
		sql = "insert into light(sln, li, state, time) values('" +
			open.sln + "', '" + open.li + "', '" + open.state + "', '" + open.time + "')";
		console.log("open: " + sql);
		connection.connect();
		connection.query(sql, function (err, result) {
			if (err) {
				console.log('[INSERT ERROR] - ', err.message);
				return;
			}
			console.log('--------------------------INSERT----------------------------');
			console.log('INSERT ID:', result);
			console.log('-----------------------------------------------------------------\n\n');
		});
		connection.end();
		old_time2 = open.time;
	}
	client.publish("sys/cloud/002200112037", open_json);
	res.end("open");
});

app.get("/yml_close", function (req, res) {
	console.log("yml_close");
	var close_time = obj.time;
	var new_close_time = dateAdd(close_time, 1);
	var close = {
		"sln": "002200222037",
		"li": obj.li,
		"state": 0,
		"time": new_close_time
	};
	var close_json = JSON.stringify(close);
	console.log(close_json);
	console.log(close.time);
	if (close.li != -1 && close.li != null && close.time != old_time3) {
		var connection = mysql.createConnection({
			host: 'localhost',
			user: 'root',
			password: '',
			port: '3306',
			database: 'node_js_test'
		});
		var sql = "";
		sql = "insert into light(sln, li, state, time) values('" +
			close.sln + "', '" + close.li + "', '" + close.state + "', '" + close.time + "')";
		console.log("close: " + sql);
		connection.connect();
		connection.query(sql, function (err, result) {
			if (err) {
				console.log('[INSERT ERROR] - ', err.message);
				return;
			}
			console.log('--------------------------INSERT----------------------------');
			console.log('INSERT ID:', result);
			console.log('-----------------------------------------------------------------\n\n');
		});
		connection.end();
		old_time3 = close.time;
	}
	client.publish("sys/cloud/002200112037", close_json);
	res.end("close");
});

var analysis_data = {
	"times": [],
	"lis": [],
	"states": []
}

app.get("/yml_analysis", function (req, res) {
	console.log("yml_analysis");
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		port: '3306',
		database: 'node_js_test'
	});
	var sql = "";
	sql = "SELECT * FROM light order by time desc limit 0, 20;";
	connection.connect();
	connection.query(sql, function (err, result) {
		if (err) {
			console.log('[SELECT ERROR] - ', err.message);
			return;
		}
		console.log(sql);
		console.log('--------------------------SELECT----------------------------');
		console.log(result);
		console.log('------------------------------------------------------------\n\n');
		if (result != null) {
			var times = [];
			var lis = [];
			var states = [];
			for (var i = result.length - 1; i > -1; i--) {
				times.push(result[i].time);
				lis.push(result[i].li);
				states.push(result[i].state);
			}
			analysis_data.times = times;
			analysis_data.lis = lis;
			analysis_data.states = states;
			var json_analysis_data = JSON.stringify(analysis_data);
			console.log(json_analysis_data);
			res.end(json_analysis_data);
		}
	});
	connection.end();
});

//登录用到的请求
app.post("/yml_login", urlencodedParser, function (req, res) {
	console.log("yml_login");
	var response = {
		"user_name": req.body.user_name,
		"pass_word": req.body.pass_word
	};
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		port: '3306',
		database: 'node_js_test'
	});
	var sql = "";
	sql = "SELECT * FROM user where user_name='" + response.user_name +
		"' && password='" + response.pass_word + "'";
	connection.connect();
	connection.query(sql, function (err, result) {
		if (err) {
			console.log('[SELECT ERROR] - ', err.message);
			return;
		}
		console.log(sql);
		console.log('--------------------------SELECT----------------------------');
		console.log(result);
		console.log('------------------------------------------------------------\n\n');
		if (result != null) {
			res.redirect('/center.html');
		} else {
			res.redirect('/login.html');
		}
	});
	connection.end();
})

app.listen(8080, () => {
	console.log('Server connecting...\nhttp://localhost:8080/');
});

function dateAdd(d, num) {
	if (d != null) {
		var d = new Date(
			d.substring(0, 4),
			d.substring(5, 7) - 1,
			d.substring(8, 10),
			d.substring(11, 13),
			d.substring(14, 16),
			d.substring(17, 19));
		d.setTime(d.getTime() + num * 1000);
		return d.getFullYear() + "-"
			+ (d.getMonth() + 1)
			+ "-" + d.getDate()
			+ " " + d.getHours()
			+ ":" + d.getMinutes()
			+ ":" + d.getSeconds();
	}

}