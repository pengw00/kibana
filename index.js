// Add this to the VERY top of the first file loaded in your app
// var apm = require('elastic-apm-node').start({
//     // Override service name from package.json
//     // Allowed characters: a-z, A-Z, 0-9, -, _, and space
//     serviceName: '',

//     // Use if APM Server requires a token
//     secretToken: '',

//     // Set custom APM Server URL (default: http://localhost:8200)
//     serverUrl: '',
//   })

var apm = require("elastic-apm-node").start();
var http = require("http");
var patterns = require("patterns")();

// Setup routes and their respective route handlers
patterns.add("GET /", require("./routes/index"));
patterns.add("GET /posts", require("./routes/posts").index);
patterns.add("GET /posts/{id}", require("./routes/posts").show);

http
  .createServer(function (req, res) {
    // Check if we have a route matching the incoming request
    var match = patterns.match(req.method + " " + req.url);

    // If no match is found, respond with a 404. Elastic APM will in
    // this case use the default transaction name "unknown route"
    if (!match) {
      res.writeHead(404);
      res.end();
      return;
    }

    // The patterns module exposes the pattern used to match the
    // request on the `pattern` property, e.g. `GET /posts/{id}`
    apm.setTransactionName(match.pattern);

    // Populate the params and call the matching route handler
    var fn = match.value;
    req.params = match.params;
    fn(req, res);
  })
  .listen(3000);
