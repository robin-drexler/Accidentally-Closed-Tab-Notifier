function Pocket(pocketConnector) {

    this.init = function (pocketConnector) {

        this.connector = pocketConnector;
    }

    this.addUrl = function (url, success, fail) {

        pocketConnector.send({
            url:'https://getpocket.com/v3/add',
            success: success,
            fail: fail,
            data:{
                url:url
            }
        });
    }


    this.init(pocketConnector);
}

