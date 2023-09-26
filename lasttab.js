let logEnabled = false;

let log = (msg) => {
	if (logEnabled) {
		console.log(msg);
	}
}

log("lasttab started");

// Fixed sized array to store tab switching history
Array.prototype.push_with_limit = function (element, limit) {
	var limit = limit || 1000;
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

let getCurrentTab = async () => {
	let queriedTabs = await browser.tabs.query({ active: true, windowId: browser.windows.WINDOW_ID_CURRENT });
	return queriedTabs[0];
}

let tabExists = async (tab) => {
	try {
		let queriedTabs = await browser.tabs.query({ windowId: tab.windowId });
		log(queriedTabs);
		for (let t of queriedTabs) {
			if (t.id === tab.tabId) {
				return true;
			}
		}
	} catch (e) {
		log(e);
	}
	return false;
}

let switchToTab = (tab) => {
	return browser.tabs.update(tab.tabId, { active: true });
}

let recordTabAccess = (tab) => {
	log("Tab " + tab.tabId + " " + tab.windowId + " was activated/focused");
	tabs.push_with_limit(new Tab(tab.tabId, tab.windowId));
}

let handleTabOnActivated = (tab) => {
	recordTabAccess(new Tab(tab.tabId, tab.windowId));
}

let handleWindowOnFocusChanged = async () => {
	let tab = await getCurrentTab();
	recordTabAccess(new Tab(tab.id, tab.windowId));
}

browser.commands.onCommand.addListener(async (command) => {
	if (command === "switch-to-last-tab") {
		log("User want to switch to last tab");
		log(tabs);
		let currentTab = await getCurrentTab();
		log(currentTab);
		for (var i = tabs.length - 1; i >= 0; i--) {
			let tab = tabs[i];
			if (tab.windowId === currentTab.windowId && tab.tabId === currentTab.id) {
				continue;
			}

			log("Found last tab");
			log(tab);

			log("Check if tab exists");
			let exists = await tabExists(tab);
			log(exists);
			if (!exists) {
				log("Can not switch because history tab doesn't exist");
				continue;
			}

			if (currentTab.windowId !== tab.windowId) {
				await browser.windows.update(tab.windowId, { focused: true });
			}

			await switchToTab(tab);

			break;
		}
	}
});

browser.tabs.onActivated.addListener(handleTabOnActivated);

browser.windows.onFocusChanged.addListener(handleWindowOnFocusChanged);