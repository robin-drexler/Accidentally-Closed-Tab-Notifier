(function () {
    var timer;

    function TabManager() {

        var tabs = {};

        this.get = function (id) {
            return tabs[id] || create()
        }

        this.set = function (id, tab) {
            tabs[id] = tab || create();
        }

        function create() {
            var tab = {
                seconds:0,
                url: undefined
            }
            return tab;
        }
    }


    tabManager = new TabManager();

    chrome.tabs.onCreated.addListener(function (tab) {
        tabManager.set(tab.id)
    });

    chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
        var currentTab = tabManager.get(tabId);

        if (info.status !== "loading") {
            return;
        }

        currentTab.url = info.url;
        tabManager.set(tabId, currentTab);
    });

    chrome.tabs.onActivated.addListener(function (tab) {
        var currentTab = tabManager.get(tab.tabId),
            seconds;

        window.clearInterval(timer);

        timer = window.setInterval(function () {
            currentTab.seconds += 1;
            tabManager.set(tab.tabId, currentTab);

        }, 1000);
    });

    chrome.tabs.onRemoved.addListener(function (tabId) {
        var currentTab = tabManager.get(tabId);

        if (currentTab.seconds <= 5) {
            console.log("OMG");
        }

    });


})()