var mqtt = require('mqtt');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({
	extended: false
});

var mysql = require('mysql');

var data = {
	"mac": "/",
	"user": "/",
	"tmp": "/",
	"heart": "/",
	"time": "/"
}
var json_data = JSON.stringify(data);

app.use(express.static('views'));
app.set('views', './views')
app.set('view engine', 'html');

var url = "mqtt://" + '115.28.108.146' + ":" + '1883'
var options = {
	clientId: 'fdb76dfa0f8141d187092f89e687a57b'
}
var client = mqtt.connect(url, options);
client.subscribe("sys/cloud/002200222037");
client.on('message', function(topic, message) {
	console.log(message.toString());
	if(message != null) {
		json_data = message;
	}

});

app.get("/", function(req, res) {
	res.redirect('/login.html');
});
var msg_id = "0000000000";
app.get("/yml_get", function(req, res) {
	//console.log("yml_get");
	var obj = JSON.parse(json_data);
	//console.log(obj);
	if(obj.mac != "/" && obj.id != msg_id) {
		var connection = mysql.createConnection({
			host: 'localhost',
			user: 'root',
			password: '',
			port: '3306',
			database: 'node_js_test'
		});
		var sql = "";
		sql = "insert into mac_temperature(mac, user, tmp, heart, time) values('" +
			obj.mac + "', '" + obj.user + "', " + obj.tmp + ", " +
			obj.heart + ", '" + obj.time + "')";
		console.log(sql);
		connection.connect();
		connection.query(sql, function(err, result) {
			if(err) {
				console.log('[INSERT ERROR] - ', err.message);
				return;
			}
			console.log('--------------------------INSERT----------------------------');
			console.log('INSERT ID:', result);
			console.log('-----------------------------------------------------------------\n\n');
		});
		connection.end();
		msg_id = obj.id;
	}
	res.end(json_data);
});

var analysis_data = {
	"times": [],
	"user": "/",
	"mac": "/",
	"tmps": [],
	"hearts": []
}

app.get("/yml_analysis", function(req, res) {
	console.log("yml_analysis");
	var mac = req.query.mac_value;
	console.log(mac);

	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		port: '3306',
		database: 'node_js_test'
	});
	var sql = "";
	sql = "SELECT * FROM mac_temperature where mac='" + mac +
		"' order by time asc limit 0,4";
	connection.connect();
	connection.query(sql, function(err, result) {
		if(err) {
			console.log('[SELECT ERROR] - ', err.message);
			return;
		}
		console.log(sql);
		console.log('--------------------------SELECT----------------------------');
		console.log(result);
		console.log('------------------------------------------------------------\n\n');
		if(result != null) {
			analysis_data.user = result[0].user;
			analysis_data.mac = result[0].mac;
			var times = [];
			var tmps = [];
			var hearts = [];
			for(var i = 0; i < result.length; i++) {
				times.push(result[i].time);
				tmps.push(result[i].tmp);
				hearts.push(result[i].heart);
			}
			analysis_data.times = times;
			analysis_data.tmps = tmps;
			analysis_data.hearts = hearts;
			var json_analysis_data = JSON.stringify(analysis_data);
			console.log(json_analysis_data);
			res.end(json_analysis_data);
		}
	});
	connection.end();
});

app.post("/yml_login", urlencodedParser, function(req, res) {
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
	connection.query(sql, function(err, result) {
		if(err) {
			console.log('[SELECT ERROR] - ', err.message);
			return;
		}
		console.log(sql);
		console.log('--------------------------SELECT----------------------------');
		console.log(result);
		console.log('------------------------------------------------------------\n\n');
		if(result != null) {
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