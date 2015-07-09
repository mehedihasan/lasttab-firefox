var main = require("../");

exports["test main"] = function(assert) {
	assert.pass("Unit test running!");
};

//TODO write more tests

require("sdk/test").run(exports);
