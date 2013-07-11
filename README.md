# ector

ECTOR is a learning chatterbot. This is its Node.js version.
[![Build Status](https://secure.travis-ci.org/parmentf/node-ector.png)](http://travis-ci.org/parmentf/node-ector)
[![NPM version](https://badge.fury.io/js/ector.png)](http://badge.fury.io/js/ector)

## Getting Started
Install the module with: `npm install ector`

```javascript
var Ector = require('ector');
var ector = new Ector();
ector.addEntry("Hello ECTOR!");
var response = ector.generateResponse();
console.log(response.sentence);
```

## Documentation
_(Coming soon)_

## Examples
The [browser-ector](https://github.com/parmentf/browser-ector) is an example of how this library can be used.

You can talk to ECTOR in the browser. [Take a chat](http://parmentf.github.com/browser-ector/ector.html).

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [mocha](http://visionmedia.github.com/mocha/).

## Release History

* 2013/01/27: version 0.1.6: add a ConceptNetwork injector.
* 2013/01/25: version 0.1.5: fix bug: replace all names in a response.
* 2013/01/17: version 0.1.4: fix bug: beg value for second sentence.
* 2013/01/17: version 0.1.3: fix bug: create node for second sentence.
* 2013/01/06: version 0.1.2: add linkNodesToLastSentence()
* 2013/01/05: version 0.1.1: fix github URL (to install)
* 2013/01/05: version 0.1.0: first release

Warning: this is a work in progress.

## License
Copyright (c) 2012 François Parmentier
Licensed under the MIT license.
