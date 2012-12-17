(function ($) {
    var timer,
        tabsToDisplay = [];

    function getTabsWithoutTabId(tabs, tabId) {
        for (var i = 0; i < tabs.length; i++) {

            if (tabs[i].id === tabId) {
                tabs.splice(i, 1);
                return tabs;
            }
        }

        return tabs;
    }

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
            tabs[id] = $.extend({}, create(), tab);
        }

        this.getAll = function () {
            return tabs;
        }

        function create() {
            var tab = {
                id: 0,
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
        tabManager.set(tab.id, {id: tab.id});
    });

    chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
        var currentTab = tabManager.get(tabId);

        if (info.status !== "complete") {
            return;
        }


        currentTab.title = tab.title;
        currentTab.url = tab.url;
        currentTab.favIconUrl = tab.favIconUrl;

        //sanitize missing favicons, gnarf chrome
        if (!currentTab.favIconUrl) {
            currentTab.favIconUrl = chrome.extension.getURL("/icons/38.png");
        }

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

        if (currentTab.seconds <= 2 && !~currentTab.url.search(/^chrome:\/\/|^chrome-extension/)) {
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
            return calcDateDifferenceInSeconds(closedAt, new Date()) > 60 * 30;
        }

        var now = new Date();
        for (var i = 0; i < tabsToDisplay.length; i++) {

            if (isTooOld(tabsToDisplay[i].closedAt)) {
                tabsToDisplay.splice(i, 1);
            }
        }
    }, 1000 * 30);

    window.setInterval(function() {
        chrome.tabs.query({active: true}, function(tabs) {
            tabs.forEach(function(tab) {
                displayPageAction(tabsToDisplay, tab.id);
            });
        });

    }, 1000);


    //Messaging
    chrome.extension.onMessage.addListener(
        function (request, sender, sendResponse) {
            console.log(request);

            if (request.purpose === "get") {
                sendResponse({tabs:tabsToDisplay});
                return;
            }

            if (request.purpose === "delete") {
                tabsToDisplay = getTabsWithoutTabId(tabsToDisplay, request.id);
            }

            if (request.purpose === "store") {
                window.localStorage.setItem(request.key, request.value);
                console.log(request);
                console.log(window.localStorage.getItem('pocket.access_token'));
            }

            sendResponse({});

        });
})(jQuery)