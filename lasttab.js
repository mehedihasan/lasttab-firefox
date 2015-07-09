var tabs = require("sdk/tabs");
var {Hotkey} = require("sdk/hotkeys");

var lasttab = null;

var hotKey = Hotkey({
	combo: "alt-z",
	onPress: function() {
		switchToLastTab();
	}
});

function switchToLastTab(){
	if(lasttab){
		lasttab.activate();
	}
}

tabs.on('deactivate', function(tab){
	lasttab = tab;
	lasttab.close = function(tab){
		lasttab = null;
	};
});