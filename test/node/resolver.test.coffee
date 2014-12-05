process.env.NODE_ENV = 'test'

assert = require "assert"
semver = require "semver"
fs = require "fs"
Resolver = require "../../lib/resolvers/node"

html = fs.readFileSync(__dirname + '/../fixtures/node.html').toString();

describe "Node Resolver", ->

  describe "default properties", ->

    before ->
      this.r = new Resolver()

    it "includes empty latest_stable", ->
      assert.equal this.r.latest_stable, ''

    it "includes empty latest_unstable", ->
      assert.equal this.r.latest_unstable, ''

    it "includes empty all", ->
      assert.equal this.r.all.length, 0

    it "includes single empty stables", ->
      assert.equal this.r.stables.length, 1
      assert.equal this.r.stables[0], ''

    it "have never been updated", ->
      assert.ok(!this.r.updated)

  describe "_parse()", ->

    before ->
      this.r = new Resolver()
      this.r._parse(html)

    it "has an array of all versions", ->
      assert.equal typeof(this.r.all), "object"
      assert.equal this.r.all.length, 79

    it "has an array of stable versions", ->
      assert.equal typeof(this.r.stables), "object"
      assert.equal this.r.stables.length, 52

    it "has a latest_stable version", ->
      assert.equal this.r.latest_stable, "0.10.29"

    it "has a latest_unstable version", ->
      assert.equal this.r.latest_unstable, "0.11.13"

    it "only includes version >=0.8.6", ->
      assert.equal this.r.all[0], '0.8.6'
      assert this.r.all.every (version) -> semver.gte(version, '0.8.6')

  describe "satisfy()", ->

    before ->
      this.r = new Resolver()
      this.r._parse(html)

    it "honors explicit version strings", ->
      assert.equal this.r.satisfy("0.10.1"), "0.10.1"
      assert.equal this.r.satisfy("0.11.1"), "0.11.1"
      assert.equal this.r.satisfy("0.8.15"), "0.8.15"

    it "matches common patterns to stable version", ->
      assert.equal this.r.satisfy("0.10.x"), this.r.latest_stable
      assert.equal this.r.satisfy("~0.10.0"), this.r.latest_stable
      assert.equal this.r.satisfy(">0.4"), this.r.latest_stable
      assert.equal this.r.satisfy(">=0.6.9"), this.r.latest_stable
      assert.equal this.r.satisfy("*"), this.r.latest_stable

    it "uses latest unstable version when request version is beyond stable version", ->
      assert.equal this.r.satisfy("0.11.x"), this.r.latest_unstable
      assert.equal this.r.satisfy("~0.11.0"), this.r.latest_unstable
      assert.equal this.r.satisfy(">0.11.0"), this.r.latest_unstable
      assert.equal this.r.satisfy(">=0.10.100"), this.r.latest_unstable

    it "returns latest stable for versions that are too old", ->
      assert.equal this.r.satisfy("0.4.1"), this.r.latest_stable

    it "defaults to latest stable version when given crazy input", ->
      assert.equal this.r.satisfy(null), this.r.latest_stable
      assert.equal this.r.satisfy(undefined), this.r.latest_stable
      assert.equal this.r.satisfy(""), this.r.latest_stable
      assert.equal this.r.satisfy("boogers"), this.r.latest_stable

    describe "with environment override", ->

      before ->
        this.r = new Resolver()
        this.r._parse(html)

      after ->
        delete process.env.STABLE_NODE_VERSION

      it "becomes latest_stable", ->
        assert.notEqual this.r.latest_stable, '0.10.15'
        process.env.STABLE_NODE_VERSION = '0.10.15'
        this.r._parse(html)
        assert this.r.latest_stable, '0.10.15'

      it "satisfies stable-seeking ranges", ->
        assert.notEqual this.r.satisfy('>0.8'), '0.10.3'
        process.env.STABLE_NODE_VERSION = '0.10.3'
        this.r._parse(html)
        assert.equal this.r.satisfy('>0.8'), '0.10.3'

      it "still resolves unstable ranges", ->
        assert.equal semver.parse(this.r.satisfy('0.11.x')).minor, 11
        process.env.STABLE_NODE_VERSION = '0.8.20'
        this.r._parse(html)
        assert.equal semver.parse(this.r.satisfy('0.11.x')).minor, 11

      it "still resolves versions at a higher patchlevel than the override", ->
        process.env.STABLE_NODE_VERSION = '0.10.18'
        this.r._parse(html)
        assert.equal this.r.satisfy('0.10.19'), '0.10.19'
