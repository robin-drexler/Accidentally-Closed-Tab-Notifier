/*
 * oauth2-chrome-extensions
 * <https://github.com/jjNford/oauth2-chrome-extensions>
 *
 * Copyright (C) 2012, JJ Ford (jj.n.ford@gmail.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * This is a streamlined version of Boris Smus solution (Aapache License v2.0).
 * <https://github.com/borismus/oauth2-extensions>
 *
 * <http://oauth.net/2/>
 *
 */

/* NOTE
 *
 * This was designed to work with the GitHub API v3. The source may need to be altered
 * to work with your providers API. However the method used to gain the OAuth2 token
 * should work if the code is correctly configured to the API being targeted.
 * Methods to update the token and save the expiration date may also need to be added.
 *
 */
(function () {

    window.OAuth2 = {

        /**
         * Initialize
         */
        init:function (data) {
            this._consumer_key = data.consumer_key; //"";
            this._access_token_url = data.access_token_url;// <--------------------- URL to api where token is request
            this._authorization_url = data.authorization_url; //"https://getpocket.com/auth/authorize"; // <------ URL to api where user authorizes extension with
            this._requesttoken_url = data.request_token_url; //""; // <------ URL to api where user authorizes extension with
            this._redirect_url = data.redirect_uri; //""; // <---------- URL where api will redirect access token request
        },

        /**
         * Begin
         */
        begin:function () {

            var authUrl = this._authorization_url + "?redirect_uri=" + this._redirect_url,

                request = new XMLHttpRequest(),
                data = {
                    redirect_uri:this._redirect_url,
                    consumer_key:this._consumer_key
                }

            request.onreadystatechange = function () {

                if (request.readyState !== 4) {
                    return;
                }

                if (request.status !== 200) {
                    throw Error('Something went wrong while using API :(');
                    return;
                }

                data = JSON.parse(request.responseText);

                window.localStorage.setItem('pocket.request_token', data.code);
                chrome.tabs.create({url:authUrl + '&request_token=' + data.code, selected:true});

            };

            request.set
            request.open("POST", this._requesttoken_url);
            request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            request.setRequestHeader('X-Accept', 'application/json');

            request.send(JSON.stringify(data));

        },
        obtainAccessToken:function (success, fail) {
            var code = window.localStorage.getItem('pocket.request_token'),
                request = new XMLHttpRequest(),
                data = {
                    code:code,
                    consumer_key:this._consumer_key
                };

            if (!code) throw Error('I haz no token');


            request.onreadystatechange = function () {
                if (request.readyState !== 4) {
                    return;
                }

                if (request.status !== 200) {
                    if (fail) {
                        fail(request.status);
                    }
                    return;
                }

                data = JSON.parse(request.responseText);

                if (success) {
                    success(data.access_token);
                }

            };

            request.open("POST", this._access_token_url);
            request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            request.setRequestHeader('X-Accept', 'application/json');

            request.send(JSON.stringify(data));
        }
    };


})();