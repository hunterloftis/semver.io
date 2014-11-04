var semver = require('semver');
var _ = require('lodash');
var agent = require('superagent');

var ALL = /[0-9]+\.[0-9]+\.[0-9]+/g;
var STABLE = /[0-9]+\.[0-9]*[02468]\.[0-9]+/g;
var TIMEOUT = 5000;
var NOOP = function() {};

module.exports = function createResolver() {
  return new Resolver();
};

function Resolver() {
  this.latest_stable = '';
  this.latest_unstable = '';
  this.all = [];
  this.stables = [''];
  this.updated = undefined;
}

Resolver.prototype.update = function(done) {
  done = done || NOOP;

  agent
    .get('http://nodejs.org/dist/')
    .timeout(TIMEOUT)
    .end(parseResponse.bind(this));

  function parseResponse(err, res) {
    if (err) return done(err, false);
    if (!res.text) return done(new Error('No response'), false);

    this.parse(res.text)
    return done(undefined, true);
  }
};

Resolver.prototype.parse = function(body) {
  this.all = _.unique(body
    .match(ALL)
    .filter(minVersion)
    .sort(versionAsc)
  );

  this.stables = _.unique(body
    .match(STABLE)
    .filter(minVersion)
    .sort(versionAsc)
  );

  if (process.env.STABLE_NODE_VERSION) {
    this.stables = this.stables.filter(maxVersion);
  }

  this.latest_unstable = _.last(this.all);
  this.latest_stable = _.last(this.stables);
  this.updated = new Date();

  function minVersion(version) {
    return semver.gte(version, '0.8.6');
  }

  function maxVersion(version) {
    return semver.lte(version, process.env.STABLE_NODE_VERSION);
  }

  function versionAsc(a, b) {
    return semver.compare(a, b);
  }
};

Resolver.prototype.satisfy = function(range) {
  if (!semver.validRange(range)) return this.latest_stable;

  return  semver.maxSatisfying(this.stables, range) ||
          semver.maxSatisfying(this.all, range) ||
          this.latest_stable;
};
