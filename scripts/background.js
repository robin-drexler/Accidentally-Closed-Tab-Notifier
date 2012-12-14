(function () {
    var timer,
        tabsToDisplay = [];


    function displayPageAction(tabs, tabId) {
        if (tabs.length > 0) {
            chrome.pageAction.show(tabId);
        } else {
            chrome.pageAction.hide(tabId);
        }
    }

    function TabManager() {

        var tabs = {};

        this.get = function (id) {
            return tabs[id] || create()
        }

        this.set = function (id, tab) {
            tabs[id] = tab || create();
        }

        this.getAll = function () {
            return tabs;
        }

        function create() {
            var tab = {
                seconds:0,
                url:undefined,
                title:"No Title",
                favIconUrl:undefined,
                closedAt:undefined
            }
            return tab;
        }
    }


    tabManager = new TabManager();

    chrome.tabs.onCreated.addListener(function (tab) {
        tabManager.set(tab.id);
    });

    chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
        var currentTab = tabManager.get(tabId);

        if (info.status !== "complete") {
            return;
        }


        currentTab.title = tab.title;
        currentTab.url = tab.url;
        currentTab.favIconUrl = tab.favIconUrl;

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
        currentTab.closedAt = new Date();

        if (currentTab.seconds <= 2 && !~currentTab.url.search(/^chrome:\/\//)) {
            tabsToDisplay.push(currentTab);
        }

    });


    //show page action or not
    chrome.tabs.onActivated.addListener(function (tab) {
        displayPageAction(tabsToDisplay, tab.tabId);
    });

    chrome.tabs.onUpdated.addListener(function (tabId) {
        displayPageAction(tabsToDisplay, tabId);
    });

    //Deleting old tabs

    window.setInterval(function () {

        function calcDateDifferenceInSeconds(begin, end) {
            return Math.ceil((end - begin) / 1000);
        }

        function isTooOld(closedAt) {
            return calcDateDifferenceInSeconds(closedAt, new Date()) > 60;
        }

        var now = new Date();
        for (var i = 0; i < tabsToDisplay.length; i++) {

            if (isTooOld(tabsToDisplay[i].closedAt)) {
                tabsToDisplay.splice(i, 1);
            }
        }
    }, 1000 * 60 * 30);


    //Messaging
    chrome.extension.onMessage.addListener(
        function (request, sender, sendResponse) {
            sendResponse({tabs:tabsToDisplay});
        });
})()