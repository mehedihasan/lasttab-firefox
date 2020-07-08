console.log("lasttab started");

// Fixed sized array to store tab switching history
Array.prototype.push_with_limit = function (element, limit) {
	var limit = limit || 100;
	var length = this.length;
	if (length >= limit) {
		this.shift();
	}
	this.push(element);
}

// Tab Identifier
class Tab {
	constructor(tabId, windowId) {
		this.tabId = tabId;
		this.windowId = windowId;
	}
}

let tabs = [];

let getCurrentTab = () => {
	return browser.tabs.query({ active: true, windowId: browser.windows.WINDOW_ID_CURRENT })
		.then(tabs => tabs[0]);
}

let switchToTab = (tab) => {
	browser.tabs.update(tab.tabId, { active: true });
}

browser.commands.onCommand.addListener(command => {
	if (command === "switch-to-last-tab") {
		console.log("User want to switch to last tab");
		console.log(tabs);
		getCurrentTab().then(currentTab => {
			console.log
			console.log(currentTab);
			for (var i = tabs.length - 1; i >= 0; i--) {
				let tab = tabs[i];
				if (tab.windowId === currentTab.windowId && tab.tabId === currentTab.id) {
					continue;
				}

				console.log("Found last tab");
				console.log(tab);

				if (currentTab.windowId === tab.windowId) {
					switchToTab(tab);
				} else {
					browser.windows.update(tab.windowId, { focused: true })
						.then(() => switchToTab(tab));
				}

				break;
			}
		});
	}
});

let recordTabAccess = (tab) => {
	console.log("Tab " + tab.tabId + " " + tab.windowId + " was activated/focused");
	tabs.push_with_limit(new Tab(tab.tabId, tab.windowId));
}

let handleTabOnActivated = (tab) => {
	recordTabAccess(new Tab(tab.tabId, tab.windowId));
}

let handleWindowOnFocusChanged = () => {
	getCurrentTab().then(tab => recordTabAccess(new Tab(tab.id, tab.windowId)));
}

browser.tabs.onActivated.addListener(handleTabOnActivated);

browser.windows.onFocusChanged.addListener(handleWindowOnFocusChanged);