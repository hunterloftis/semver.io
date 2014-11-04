# semver.io

semver.io is a plaintext and JSON webservice that tracks [all available versions
of node.js](http://nodejs.org/dist) and [nginx](http://nginx.org/download/). It
uses that version info to resolve
[semver range queries](https://npmjs.org/doc/misc/semver.html#Ranges). It's used
by Heroku's [node
buildpack](https://github.com/heroku/heroku-buildpack-nodejs/blob/5754e60de7b8472d5070c9b713a898d353845c68/bin/compile#L18-22)
and is open-sourced [on GitHub](https://github.com/heroku/semver.io).

## On the command line

### For nodejs

```sh
curl https://semver.io/node/stable
# {{node:current_stable_version}}

curl https://semver.io/node/unstable
# {{node:current_unstable_version}}

curl https://semver.io/node/resolve/0.8.x
# 0.8.26
```

### For nginx

```sh
curl https://semver.io/nginx/stable
# {{nginx:current_stable_version}}
```

## In the browser

There's also a CORS-friendly HTTP endpoint at
[semver.io/node.json](https://semver.io/node.json) and
[semver.io/nginx.json](https://semver.io/nginx.json) that gives you the whole
kit and caboodle:

```js
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://semver.io/node.json', true);
  xhr.onload = function () { console.log(xhr.responseText); };
  xhr.send();
```

The response is something like:

```json
{
  "stable": "0.10.22",
  "unstable": "0.11.8",
  "versions": [
    "0.8.6",
    "...",
    "0.11.9"
  ]
}
```

## Ranges

semver.io supports any range that [node-semver](https://github.com/isaacs/node-semver) can parse. Here are some examples (these also work for nginx):

- [/node/resolve/0.10.x](https://semver.io/node/resolve/0.10.x)
- [/node/resolve/0.11.x](https://semver.io/node/resolve/>=0.11.5)
- [/node/resolve/~0.10.15](https://semver.io/node/resolve/~0.10.15)
- [/node/resolve/>0.4](https://semver.io/node/resolve/>0.4)
- [/node/resolve/>=0.8.5 <=0.8.14](https://semver.io/node/resolve/>=0.8.5 <=0.8.14)

These named routes are also provided for convenience:

- [/node/stable](https://semver.io/node/stable)
- [/node/versions](https://semver.io/node/versions)
- [/nginx/unstable](https://semver.io/nginx/unstable)

## How does it work?

- node: Parses version data from [nodejs.org/dist](http://nodejs.org/dist/)
- nginx: Parses nginx's tarball filenames from [nginx.org/download](http://nginx.org/download)

Semver.io is designed to support any software that follows the semver [rules](http://semver.org/).
Pull requests are welcome for other platforms!

## Links

- [what-is-the-latest-version-of-node.com](http://what-is-the-latest-version-of-node.com)
- [semver.org](http://semver.org)
- [github.com/heroku/heroku-buildpack-nodejs](https://github.com/heroku/heroku-buildpack-nodejs#readme)
- [github.com/heroku/semver.io](https://github.com/heroku/semver.io#readme)
- [github.com/isaacs/node-semver](https://github.com/isaacs/node-semver#readme)
- [npmjs.org/doc/misc/semver.html#Ranges](https://npmjs.org/doc/misc/semver.html#Ranges)
- [npmjs.org/package/node-version-resolver](https://npmjs.org/package/node-version-resolver)
