var App = require('./lib/app');
if (process.env.NODE_ENV === 'production') {
  require('newrelic');
}

var app = new App();

app.listen(process.env.PORT || 5000);
