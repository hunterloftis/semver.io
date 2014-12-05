var semver = require('semver');
var _ = require('lodash');
var NpmStats = require('npm-stats');

var TIMEOUT = 5000;
var NOOP = function() {};

var DEFAULTS = {
  all: [],
  stable: [],
  updated: undefined
};

module.exports = NpmSource;

function NpmSource(options) {
  this.registry = NpmStats();
  _.extend(this, DEFAULTS, options);
}

NpmSource.prototype.update = function(done) {
  done = done || NOOP;

  this.registry
    .module('npm')
    .info(parseResponse.bind(this));

  function parseResponse(err, info, response) {
    if (err) return done(err, false);
    if (response['status-code'] !== 200) return done(new Error('Bad response'), false);

    this._parse(info.versions);
    done(undefined, true);
  }
};

NpmSource.prototype._parse = function(versionObj) {
  var versions = _.unique(Object.keys(versionObj));

  this.all = versions.sort(semver.compare);
  this.stable = this.all;
  this.updated = Date.now();
};
