var tabs = {},
    timer;


function newTab() {
    var defaults = {
        seconds: 0
    }
    return defaults;
}


chrome.tabs.onCreated.addListener(function (tab) {

    tabs[tab.id] = newTab();
    //console.log(tabs);
});

chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
    var currentTab = tabs[tabId] || newTab();

    if (info.status !== "loading") {
        return;
    }

    currentTab.url = info.url;
    tabs[tabId] = currentTab;
});

chrome.tabs.onActivated.addListener(function (tab) {
    var currentTab = tabs[tab.tabId] || newTab(),
        seconds;

    window.clearInterval(timer);

    timer = window.setInterval(function () {
        currentTab.seconds += 1;
        tabs[tab.tabId] = currentTab;

    }, 1000);
});

chrome.tabs.onRemoved.addListener(function (tabId) {
    var currentTab = tabs[tabId] || newTab();

    if (currentTab.seconds <= 10) {
        console.log("OMG");
    }

});