function PocketOauth(oAuthProvider) {

    var self = this;

    this.accessTokenKey = 'pocket.access_token';


    this.init = function (oAuthProvider) {
        this.oAuthData = {
            access_token_url:'https://getpocket.com/v3/oauth/authorize',
            redirect_uri:'http://blog.robin-drexler.com/oauthredirect',
            request_token_url:'https://getpocket.com/v3/oauth/request',
            consumer_key:'11132-85c84eb8a8cfbb7df1a29175',
            authorization_url:'https://getpocket.com/auth/authorize',
            key:this.accessTokenKey //No usage yet, Gelööööt
        };

        oAuthProvider.init(this.oAuthData);

        this.oAuthProvider = oAuthProvider;
    }

    this.send = function (data) {
        var accessToken = getAccessToken(this.oAuthProvider),
            request = new XMLHttpRequest(),
            requestData = data.data;

        requestData.consumer_key = this.oAuthData.consumer_key;
        requestData.access_token = accessToken;



        request.onreadystatechange = function () {
            if (request.readyState !== 4) {
                return;
            }

            if (request.status !== 200) {

                if (request.status == 401) {
                    self.oAuthProvider.begin();
                    return;
                }

               if (data.fail) {
                   data.fail(request.status);
               }

                return;
            }

            if (data.success) {
                data.success();
            }

        };


        request.open('POST', data.url);
        request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        request.setRequestHeader('X-Accept', 'application/json');
        request.send(JSON.stringify(requestData));


    }

    this.getOauthProvider = function () {
        return this.oAuthProvider;
    }

    function getAccessToken() {
        var token = window.localStorage.getItem(self.accessTokenKey);

        if (!token) {
            self.oAuthProvider.begin();
            return;
        }

        return token;
    }

    this.init(oAuthProvider);
}