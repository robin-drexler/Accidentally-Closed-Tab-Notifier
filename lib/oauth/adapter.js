(function (pocketConnector) {
    function removeTab() {
        chrome.tabs.getCurrent(function (tab) {
            chrome.tabs.remove(tab.id, function () {
            });
        });
    }


    pocketConnector.getOauthProvider().obtainAccessToken(function (token) {
        chrome.extension.sendMessage({purpose:'store', key:'pocket.access_token', value:token}, function (response) {
            removeTab();
        });
    }, function (status) {
        var message = 'Oh something went wrong. Try again later.';

        if (status == 403) {
            message = 'Meh. You refused to grant access :(';
        }

        alert(message);

        removeTab();
    });
})(new PocketOauth(window.OAuth2))
