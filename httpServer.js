// Code adapted from: https://github.com/claireellul/cegeg077-week5server/blob/master/httpServer.js


// Create global variables 
var express = require('express'); //server forms a part of nodejs program
var path = require("path"); 
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());


// Additional functionality when PhoneGap has a server in use, supporting cross-domain queries
app.use(function(req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
	res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	next();
});



///------ SUBMITTING and RETRIEVING question answers -----///
// Upload the submitted form data as inputted from user in web application
app.post('/SubmitData',function(req,res){
       console.dir(req.body);
       pool.connect(function(err,retrieveQ,done) {
             if(err){
             console.log("no connection available"+ err);
             res.status(400).send(err);
             }

// Create string for the geometry components latitude and longitude to bring together as one variable
var geometrystring = "st_geomfromtext('POINT(" + req.body.lng + " " + req.body.lat + ")'";

//Create string for other table components and their corresponding answers to be used in upload Answer 
var querystring = "INSERT into questions (questionlock,question,answera,answerb,answerc,answerd,rightans,location) values ('";
querystring = querystring + req.body.questionlock + "','" + req.body.question + "','" + req.body.answera+"','" + req.body.answerb+"','" + req.body.answerc+"','" + req.body.answerd+"','" + req.body.rightans+"'," + geometrystring +"))";
		console.log(querystring);
		retrieveQ.query( querystring,function(err,result) {
			done();
			if(err){
				console.log(err);
				res.status(400).send(err);
			}
			res.status(200).send("Question submitted to database");
		});
	});
});





// Upload the stored answers from the database to be retrieved in the mobile application 
app.post('/UpAns',function(req,res){ //UpAns = Uploaded Answers
       console.dir(req.body);
       pool.connect(function(err,retrieveQ,done) { 
             if(err){
             console.log("no connection available"+ err);
             res.status(400).send(err);
             }
var querystring = "INSERT into answers (question,answer,rightans) values ('";
querystring = querystring + req.body.question + "','" + req.body.answer +"','" + req.body.AnsRight+"')";
		console.log(querystring);
        retrieveQ.query( querystring,function(err,result) {
			done();
			if(err){
               console.log(err);
               res.status(400).send(err);
          }
          res.status(200).send("Answer uploaded!");
       });
	});
});




// The QuesGet function allows both web and mobile applications to retrieve the question data (question location etc.) from the database
app.get('/getQuestions', function (req,res) { //QuesGet
     pool.connect(function(err,retrieveQ,done) {
       if(err){
           console.log("no connection available"+ err);
           res.status(400).send(err);
       }
        // The geoJSON functionality inbuilt within system is used transform location data in the geometry column of the database table 
        /* The desired geoJSON format was created using a query adapted from:
		http://www.postgresonline.com/journal/archives/267-Creating-GeoJSON-Feature-Collections-with-JSON-and-PostGIS-functions.html, accessed 2nd May 2018*/

        	var querystring = " SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features  FROM ";
        	querystring = querystring + "(SELECT 'Feature' As type     , ST_AsGeoJSON(lg.location)::json As geometry, ";
        	querystring = querystring + "row_to_json((SELECT l FROM (SELECT questionlock, question, answera, answerb, answerc, answerd, rightans) As l      )) As properties";
        	querystring = querystring + "   FROM questions  As lg limit 100  ) As f ";
        	console.log(querystring);
        	retrieveQ.query(querystring,function(err,result){

			done(); //release client back to the pool
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
           res.status(200).send(result.rows);
       });
    });
});













// Add functionality in order to log any requests
app.use(function (req, res, next) {
	var filename = path.basename(req.url);
	var extension = path.extname(filename);
		console.log("The file " + filename + " was requested.");
		next();
});


// By using a http server, files can be served to the Edge browser
var http = require('http');
var httpServer = http.createServer(app);
httpServer.listen(4480);
app.get('/',function (req,res) {
		res.send("hello world from the HTTP server");
});






// Create global variables 
var fs = require('fs'); //ensures the files are synced
var configtext = ""+fs.readFileSync("/home/studentuser/certs/postGISConnection.js");
var configarray = configtext.split(","); //converts config file to desired format
var config = {};
for (var i = 0; i < configarray.length; i++) {
    var split = configarray[i].split(':');
    config[split[0].trim()] = split[1].trim();
}


var pg = require('pg');
var pool = new pg.Pool(config);















// tells the http server how to jump from folder to folder through directories 


// The / indicates the path that you type into the server - in this case, what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx
app.get('/:name1', function (req, res) {
	// Run some server-side code
	// The console is the command line of your server - you will see the console.log values in the terminal window
	console.log('request '+req.params.name1);
	// The res is the response that the server sends back to the browser - you will see this text in your browser window
	res.sendFile(__dirname + '/'+req.params.name1);
});

// Adding an additional path
// The / indicates the path that you type into the server - in this case, what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx
app.get('/:name1/:name2', function (req, res) {
	console.log('request '+req.params.name1+"/"+req.params.name2);
	res.sendFile(__dirname + '/'+req.params.name1+'/'+req.params.name2);
});

// Adding an additional path
// The / indicates the path that you type into the server - in this case, what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx/xxxx
app.get('/:name1/:name2/:name3', function (req, res) {
	console.log('request '+req.params.name1+"/"+req.params.name2+"/"+req.params.name3);
	res.sendFile(__dirname + '/'+req.params.name1+'/'+req.params.name2+ '/'+req.params.name3);
});

// Adding an additional path
// The / indicates the path that you type into the server - in this case, what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx/xxxx
app.get('/:name1/:name2/:name3/:name4', function (req, res) {
	console.log('request '+req.params.name1+"/"+req.params.name2+"/"+req.params.name3+"/"+req.params.name4);
	res.sendFile(__dirname + '/'+req.params.name1+'/'+req.params.name2+ '/'+req.params.name3+"/"+req.params.name4);
});
