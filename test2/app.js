var express = require('express');
var app = express();
var path = require('path')
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({
	extended: false
});

app.use(express.static('views'));
app.set('views','./views')
app.set('view engine', 'html');

app.listen(8080, () => {
	console.log('Demo server listening on port 8080');
});
var mqtt = require("mqtt");
var client = mqtt.connect(
	"mqtt://115.28.108.146", {
		port: 1883,
		clientId: "fdb76dfa0f8141d187092f89e687a57b"
	}
);

client.subscribe("sys/cloud/002200222037");

app.get("/ymlget", function(req, res) {
	console.log(req.query.value);
	client.on('message', function(topic, message) {
		console.log(message.toString());
		res.status(200).json(message.toString());
	});
});

app.post('/login', urlencodedParser, function(req, res) {
	var response = {
		"user_name": req.body.user_name,
		"pass_word": req.body.pass_word
	};
	var mysql = require('mysql');
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		port: '3306',
		database: 'node_js_test'
	});
	connection.connect();
	var sql = "SELECT * FROM user where user_name='" + response.user_name +
		"' && password='" + response.pass_word + "'";
	connection.query(sql, function(err, result) {
		if(err) {
			console.log('[SELECT ERROR] - ', err.message);
			return;
		}
		console.log(sql);
		console.log('--------------------------SELECT----------------------------');
		console.log(result);
		console.log('------------------------------------------------------------\n\n');
		if(result.length > 0){
			res.redirect('/index.html');
		}
		else{
			res.redirect('/login.html');
		}
	});
	connection.end();
	
	
})