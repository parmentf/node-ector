# ector

ECTOR is a learning chatterbot. This is its Node.js version.
[![Build Status](https://secure.travis-ci.org/parmentf/node-ector.png)](http://travis-ci.org/parmentf/node-ector)
[![NPM version](https://badge.fury.io/js/ector.png)](http://badge.fury.io/js/ector)
[![NPM](https://nodei.co/npm/ector.png)](https://nodei.co/npm/ector/)

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

### Class Ector
Use it to instanciate one bot.

Warning: username and botname should be at least 3 characters long.

## Constructor
### botname
_string_ name of the bot (default: `ECTOR`)
### username
_string_ name of the user (default:  `Guy`)

## setUser
### username
_string_ new user's name

return the user's name or an Error.

## setName
### botname
_string_ new bot's name

return _string|Error_ the name of the bot, or an Error.

## addEntry
Add an entry into the ECTOR's Concept Network
### entry
_string_ One or several sentences.
### cns
_conceptNetworkState_ see [ConceptNetworkState].

return _Array|Error_ array of token nodes used in the entry.

## generateResponse
Generate a response from the Concept Network and a network state.

return _Object_ { response, nodes } The _response_ is a string, and _nodes_ is an array of nodes (see [linkNodesToLastSentence]).

## linkNodesToLastSentence

Link nodes to the previous sentence node id (this is automatically set by
[addEntry](https://github.com/parmentf/node-ector#addentry), it is the node id
of the first sentence of the entry).

Used with the nodes returned by [addEntry](https://github.com/parmentf/node-ector#addentry).

### nodes

_Array_ Array of nodes ids.

## injectConceptNetwork
Inject a new [ConceptNetwork] constructor.
Useful when one wants to use specialized ConceptNetwork (e.g.
[FileConceptNetwork](https://github.com/parmentf/node-file-concept-network)).

WARNING: reinitialize `this.cn` and `this.cn[this.username].cns`

### NewConceptNetwok
_ConceptNetwork_ derivated class of [ConceptNetwork](https://github.com/parmentf/node-concept-network).

_(Coming soon)_

## Examples
The [browser-ector](https://github.com/parmentf/browser-ector) is an example of how this library can be used.

You can talk to ECTOR in the browser. [Take a chat](http://parmentf.github.com/browser-ector/ector.html).

Or you add the [hubot-ector script](https://github.com/parmentf/hubot-ector)
to a [Hubot](https://github.com/github/hubot).

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [mocha](http://visionmedia.github.com/mocha/).

## Release History

* 2014/08/07: version 0.1.7: fix bug: injector did not always work.
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
