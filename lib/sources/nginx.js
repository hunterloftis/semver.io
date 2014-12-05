var semver = require('semver');
var _ = require('lodash');
var agent = require('superagent');

var NGINX_SEMVER = /\bnginx-(\d+\.\d+\.\d+)\b/g;

var TIMEOUT = 5000;
var NOOP = function() {};

var DEFAULTS = {
  url: 'http://nginx.org/download',
  all: [],
  stable: [],
  updated: undefined
};

module.exports = NodeSource;

function NodeSource(options) {
  _.extend(this, DEFAULTS, options);
}

NodeSource.prototype.update = function(done) {
  done = done || NOOP;

  agent
    .get(this.url)
    .timeout(TIMEOUT)
    .end(parseResponse.bind(this));

  function parseResponse(err, res) {
    if (err) return done(err, false);
    if (!res.text) return done(new Error('No response'), false);
    if (res.status !== 200) return done(new Error('Bad response'), false);

    this._parse(res.text)
    done(undefined, true);
  }
};

NodeSource.prototype._parse = function(body) {
  var matches = body.match(NGINX_SEMVER);
  var versions = _.unique(matches.map(justVersion));

  this.all = versions.sort(semver.compare);
  this.stable = versions.filter(isEven);
  this.updated = Date.now();

  function justVersion(match) {
    return match.slice(6);
  }

  function isEven(version) {
    return semver(version).minor % 2 === 0;
  }
};
