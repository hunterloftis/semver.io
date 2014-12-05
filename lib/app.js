var _ = require('lodash');
var logfmt = require('logfmt');
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');

var router = require('./router');
var render = require('./render');
var Resolver = require('./resolver');

var NodeSource = require('./sources/node');
var NpmSource = require('./sources/npm');

module.exports = function App() {
  var app = express();
  var env = process.env;
  var resolvers = {
    node: new Resolver(new NodeSource(), env.MIN_NODE_VERSION, env.MAX_NODE_VERSION),
    npm: new Resolver(new NpmSource(), env.MIN_NPM_VERSION, env.MAX_NPM_VERSION)
  };

  app.resolvers = resolvers;

  if (env.NODE_ENV !== 'test') {
    app.use(logfmt.requestLogger());
  }

  return app
    .use(cors())
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .use('/node:format?', router(resolvers.node))
    .use('/npm:format?', router(resolvers.npm))
    .get('/', renderInstructions)
    .get('/ssl', sendSSL);

  function renderInstructions(req, res, next) {
    render(resolvers, onRender);

    function onRender(err, html) {
      if (err) throw err;
      res.send(html);
    }
  }

  function sendSSL(req, res, next) {
    res.type('text');
    res.send([
      '"Demonstration of domain control for DigiCert order #00462258"',
      '"Please send the approval email to: ops@heroku.com"'
    ].join('\n'));
  }
};
