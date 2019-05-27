// Run a node.js web server for local development of a static web site. Create a
// site folder, put server.js in it, create a sub-folder called "public", with
// at least a file "index.html" in it. Start the server with "node server.js &",
// and visit the site at the address printed on the console.
//   The server is designed so that a site will still work if you move it to a
// different platform, by treating the file system as case-sensitive even when
// it isn't (as on Windows and some Macs). URLs are then case-sensitive.
//   All HTML files are assumed to have a .html extension and are delivered as
// application/xhtml+xml for instant feedback on XHTML errors. Content
// negotiation is not implemented, so old browsers are not supported. Https is
// not supported. Add to the list of file types in defineTypes, as necessary.

// Change the port to the default 80, if there are no permission issues and port
// 80 isn't already in use. The root folder corresponds to the "/" url.
let port = 8080;
let root = "./public"

// Load the library modules, and define the global constants and variables.
// Load the promises version of fs, so that async/await can be used.
// See http://en.wikipedia.org/wiki/List_of_HTTP_status_codes.
// The file types supported are set up in the defineTypes function.
// The paths variable is a cache of url paths in the site, to check case.
let http = require("http");
let fs = require("fs").promises;
let OK = 200, NotFound = 404, BadType = 415, Error = 500;
let types, paths;

let fsnp = require("fs");
var key = fsnp.readFileSync('encryption/ca.key');
var cert = fsnp.readFileSync( 'encryption/ca.crt' );

var options = {
  key: key,
  cert: cert
};
var https = require('https');
var qs = require('qs');
var sqlite3 = require('sqlite3'); let db;
var cred = require('credential');
var cookie = require('cookie');
var crypto = require('crypto');
var urlParser = require('url');

var sessionData = {};

// Start the server:
start();

// Check the site, giving quick feedback if it hasn't been set up properly.
// Start the http service. Accept only requests from localhost, for security.
// If successful, the handle function is called for each request.
async function start() {
  try {
    
    await fs.access(root);
    await fs.access(root + "/landing.html");
    
    types = defineTypes();
    
    paths = new Set();
    paths.add("/");
    
    let service = https.createServer(options, handle).listen(8080);
    
    let address = "http://localhost";
    if (port != 80) address = address + ":" + port;
    console.log("Server running at", address);
    
    db = new sqlite3.Database('database.db', (err) => {
      if (err) {
      return console.error(err.message);
      }
      console.log('Connected to the SQlite database.');
    });
    
    
  }
  catch (err) { console.log(err); process.exit(1); }
}



// Serve a request by delivering a file.
async function handle(request, response) {
  var session;
  var cookies = cookie.parse(request.headers.cookie || '');
  if (cookies.session == undefined){
    //TODO: tiny possibility of clash here, do a while loop or somthing
    var session = crypto.randomBytes(256);
    response.setHeader('set-cookie', cookie.serialize('session',session) );
    //add session token to sessionData for later storage of state info
    sessionData[session] = {}
    //redirect to login page
    response.writeHead(302, {
      'Location': './landing.html'
    });
    response.end();
  } else {
    session = cookies.session;
  }
  
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); 
  var yyyy = today.getFullYear();

  today = Date.parse(yyyy + '-' + mm + '-' + dd);
  
  let url = request.url;
  console.log(url);
  
  
  if (url.startsWith('/do/')){
    //action urls
    if (url.startsWith("/do/login")){
      sessionData[session] = {}
      handlePOST(request, response, function(parsedBody){
        
        var statement = db.prepare("SELECT * FROM users WHERE username = ?");
        statement.get(parsedBody.email, function(err, row){
          if (row != undefined){
            
            //database contains email, check password matches
            cred().verify(row.passwordhash, parsedBody.password, function(err, isValid){
              if (err) {throw err;}
              if (isValid){
                //successful login
                console.log("successful login");
                
                //add userID to sessionData
                sessionData[session].userID = row.id;
                
                //redirect to dashboard page
                deliver(response,"text/plain","login successful");
                
              } else{
                //error: password didnt match
              }
            });
            
          } else{
            //error: no matching username
          }
        });
        //check database for user with that username
        //check if the password is the same
        //if so, send them to dashboard
        //else return landing page with error
      });
      
    } else if (url.startsWith('/do/signup')){
      handlePOST(request, response, function(parsedBody){
        
        if (validateEmail(parsedBody.email)){

          //check if database contains a user with this email
          var statement = db.prepare("SELECT * FROM users WHERE username = ?");
          statement.get(parsedBody.email, function(err, row){
            if (row == undefined){

              //check if passwords are the same and at least 8 characters 
              if (parsedBody.password == parsedBody.password2 &&
                parsedBody.password.length >= 8){

                //encrypt password
                cred().hash(parsedBody.password, function(err, hash){
                  if (err) { throw err; } 
                  //prepare input statement
                  var inputStatement = db.prepare("INSERT INTO users (username, passwordhash, datejoined) VALUES (?, ?, ?)");
                  //insert new user into db
                  inputStatement.run([parsedBody.email, hash, Date.now()], function(err){
                    
                    //add userID to sessionData
                    sessionData[session].userID = this.lastID;

                    //redirect to dashboard page
                    deliver(response,"text/plain","signup successful");
                    
                  });
                  inputStatement.finalize();
                  
                  
                  
                });

              } else {
                //return error: password invalid
                fail(response, 401, "invalid password");
                console.log("invalid pass");
              }
            } else {
              //return error: user already exists
                fail(response, 401, "email in use");
              console.log("user exists");
            }
          });
          statement.finalize();
        } else {
          //send error
          fail(response, 401, "invalid email");
        }

      });
      
    } else if (url.startsWith('/do/create/')) {
      
      if (url.startsWith('/do/create/task')){
         handlePOST(request, response, function(parsedBody){
           //check valid name
           if (parsedBody.name.length > 0 &&
               parsedBody.name.length < 100){
             //check valid date
             if (Date.parse(parsedBody.due) >= today){
               //prepare an insert statement
               var statement = db.prepare('INSERT INTO tasks (userid, name, datedue, datecreated, complete) VALUES (?, ?, ?, ?, 0)');
               statement.run([sessionData[session].userID,
                              parsedBody.name, 
                              Date.parse(parsedBody.due),
                              Date.now()]);
               statement.finalize();
               //return some kind of message confirming inbsertion
               
               response.writeHead(302, {
                 'Location': '../../dashboard.html'
               });
               response.end();
                
             } else {
               //display error: date in past
             }
           } else {
             //display error: invalid task name
           }
         });
        
      } else if (url.startsWith('/do/create/goal')){
        handlePOST(request, response, function(parsedBody){
           //check valid name
           if (parsedBody.name.length > 0 &&
               parsedBody.name.length < 100){
             //check valid date
             if (Date.parse(parsedBody.due) >= today){
               //check all task names are valid
               var validTasks = true;
               parsedBody.task.forEach(function(task){
                 if (task.length == 0 || task.length > 100){
                   validTasks = false;
                 }
               });
               if (validTasks){
                 //prepare an insert statement
                 var statement = db.prepare('INSERT INTO goals (userid, name, notes, datedue, datecreated, complete) VALUES (?, ?, ?, ?, ?, 0)');
                 statement.run([sessionData[session].userID,
                                parsedBody.name, 
                                parsedBody.notes,
                                Date.parse(parsedBody.due),
                                Date.now()],
                                function(err){
                   if (err) { throw err; }
                   console.log(this.lastID);
                   var goalID = this.lastID;
                   parsedBody.task.forEach(function(task){

                     var statement = db.prepare('INSERT INTO tasks (userid, goalid, name, datedue, datecreated, complete) VALUES (?, ?, ?, ?, ?, 0)');
                     statement.run([sessionData[session].userID,
                                    goalID,
                                    task, 
                                    Date.parse(parsedBody.due),
                                    Date.now()]);
                   });
                 });
                 //return some kind of message confirming insertion

                 response.writeHead(302, {
                   'Location': '../../dashboard.html'
                 });
                 response.end();
               }
             } else {
               //display error: date in past
             }
           } else {
             //display error: invalid task name
           }
         });
        
      } else if (url.startsWith('/do/create/project')){
        
      }
    } else if (url.startsWith('/do/update/')){
      
      if(url.startsWith('/do/update/task')){
        
      
      var querystring = urlParser.parse(url, true).query;
      parsedQuery = qs.parse(querystring);
      //update db
      console.log('parsedQuery: ' + parsedQuery);
      var statement = db.prepare('UPDATE tasks SET complete = ? WHERE id = ?');
      statement.run([parsedQuery.completed, parsedQuery.taskID]);
      statement.finalize();
      //respond to client 
      let typeHeader = { "Content-Type": "text/plain" };
      response.writeHead(OK, typeHeader);
      response.write("success");
      response.end();
      }
    }
  } else if (url.startsWith('/get/')) {
    //retrieval urls
    
    if (url.startsWith('/get/tasks')){
      
      var querystring = urlParser.parse(url, true).query;
      parsedQuery = qs.parse(querystring);
      
      var statement = db.prepare('SELECT * FROM tasks WHERE userid=? AND goalid IS NULL AND datedue>=? AND datedue<=? ');
      statement.all([sessionData[session].userID,
                    Date.parse(parsedQuery.startDate),
                    Date.parse(parsedQuery.startDate) + (parsedQuery.nDays * 1000 * 60 * 60 * 24)], 
        function(err,rows){
          //return this as a json object
          let typeHeader = { "Content-Type": "json" };
          response.writeHead(OK, typeHeader);
          response.write(JSON.stringify(rows));
          response.end();
        });
      
    } else if (url.startsWith('/get/goals')){
      //get and parse the query string
      var querystring = urlParser.parse(url, true).query;
      parsedQuery = qs.parse(querystring);
      
      var statement = db.prepare('SELECT goals.name AS goalname, tasks.name AS taskname, goals.notes AS notes, '+
                                        'goals.id AS goalid, tasks.id AS taskid, tasks.complete AS complete ' +
                                 'FROM goals INNER JOIN tasks ' +
                                 'ON goals.id = tasks.goalid ' +
                                 'WHERE goals.userid = ? '+
                                 'AND goals.datedue BETWEEN ? AND ? '+
                                 'ORDER BY goals.id');
      var startDate, endDate;
      if (Date.parse(parsedQuery.startDate) <= Date.parse(parsedQuery.startDate) + (parsedQuery.nDays * 1000 * 60 * 60 * 24)){
        startDate = Date.parse(parsedQuery.startDate);
        endDate = Date.parse(parsedQuery.startDate) + (parsedQuery.nDays * 1000 * 60 * 60 * 24);
      } else {
        endDate = Date.parse(parsedQuery.startDate);
        startDate = Date.parse(parsedQuery.startDate) + (parsedQuery.nDays * 1000 * 60 * 60 * 24);
      }
      statement.all([sessionData[session].userID, startDate, endDate], 
                  function(err, rows){
        console.log(rows);
        var nRows = rows.length;
        if (nRows != 0){
          //create new goal
          var currentGoal = {};
          currentGoal.id   = rows[0].goalid;
          currentGoal.name = rows[0].goalname;
          currentGoal.notes = rows[0].notes;
          currentGoal.tasks = [];
          var returnList = [];

          for (var i = 0; i < nRows; i++) {
            if(rows[i].goalid != currentGoal.id){
              //if goalid does not match, push old goal onto list 
              returnList.push(currentGoal);
              //then make new goal object
              currentGoal = {};
              currentGoal.id   = rows[i].goalid;
              currentGoal.name = rows[i].goalname;
              currentGoal.notes = rows[i].notes;
              currentGoal.tasks = [];
            } 
            var newTask = {id:rows[i].taskid, name:rows[i].taskname, complete:rows[i].complete};
            currentGoal.tasks.push(newTask);
          }
          returnList.push(currentGoal);

          //return this as a json object
          let typeHeader = { "Content-Type": "json" };
          response.writeHead(OK, typeHeader);
          response.write(JSON.stringify(returnList));
          response.end();

          console.log(returnList);
        }
      });
    }
      
  } else {
    
    if (url.endsWith("/")) url = url + "landing.html";

    let ok = await checkPath(url);
    if (! ok) return fail(response, NotFound, "URL not found (check case)");

    let type = findType(url);
    if (type == null) return fail(response, BadType, "File type not supported");

    let file = root + url;
    let content = await fs.readFile(file);
    deliver(response, type, content);
    
  } 
}

function validateEmail(email){
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function handlePOST(request, response, callback){
  if (request.method == 'POST') {
    var body = '';
    //load in the post request body
    request.on('data', function (data) {
      body += data;
      // limit post body to 1MB
      if (body.length > Math.pow(10,6)) { 
        request.connection.destroy();
      }
    });
    //code for when the body has been loaded
    request.on('end', function () {
      var parsedBody = qs.parse(body);
      console.log(parsedBody);
      callback(parsedBody);
    });
  }
}

// Check if a path is in or can be added to the set of site paths, in order
// to ensure case-sensitivity.
async function checkPath(path) {
  if (! paths.has(path)) {
    let n = path.lastIndexOf("/", path.length - 2);
    let parent = path.substring(0, n + 1);
    let ok = await checkPath(parent);
    if (ok) await addContents(parent);
  }
  return paths.has(path);
}

// Add the files and subfolders in a folder to the set of site paths.
async function addContents(folder) {
  let folderBit = 1 << 14;
  let names = await fs.readdir(root + folder);
  for (let name of names) {
    let path = folder + name;
    let stat = await fs.stat(root + path);
    if ((stat.mode & folderBit) != 0) path = path + "/";
    paths.add(path);
  }
}

// Find the content type to respond with, or undefined.
function findType(url) {
  let dot = url.lastIndexOf(".");
  let extension = url.substring(dot + 1);
  return types[extension];
}

// Deliver the file that has been read in to the browser.
function deliver(response, type, content) {
  let typeHeader = { "Content-Type": type };
  response.writeHead(OK, typeHeader);
  response.write(content);
  response.end();
}

// Give a minimal failure response to the browser
function fail(response, code, text) {
  let textTypeHeader = { "Content-Type": "text/plain" };
  response.writeHead(code, textTypeHeader);
  response.write(text, "utf8");
  response.end();
}

// The most common standard file extensions are supported, and html is
// delivered as "application/xhtml+xml".  Some common non-standard file
// extensions are explicitly excluded.  This table is defined using a function
// rather than just a global variable, because otherwise the table would have
// to appear before calling start().  NOTE: add entries as needed or, for a more
// complete list, install the mime module and adapt the list it provides.
function defineTypes() {
  let types = {
    html : "text/html",
    css  : "text/css",
    js   : "application/javascript",
    mjs  : "application/javascript", // for ES6 modules
    png  : "image/png",
    gif  : "image/gif",  // for images copied unchanged
    jpeg : "image/jpeg",   // for images copied unchanged
    jpg  : "image/jpeg",   // for images copied unchanged
    svg  : "image/svg+xml",
    json : "application/json",
    pdf  : "application/pdf",
    txt  : "text/plain",
    ttf  : "application/x-font-ttf",
    woff : "application/font-woff",
    aac  : "audio/aac",
    mp3  : "audio/mpeg",
    mp4  : "video/mp4",
    webm : "video/webm",
    ico  : "image/x-icon", // just for favicon.ico
    xhtml: undefined,    // non-standard, use .html
    htm  : undefined,    // non-standard, use .html
    rar  : undefined,    // non-standard, platform dependent, use .zip
    doc  : undefined,    // non-standard, platform dependent, use .pdf
    docx : undefined,    // non-standard, platform dependent, use .pdf
  }
  return types;
}