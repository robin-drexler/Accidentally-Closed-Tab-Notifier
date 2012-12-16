$(function () {

    var tpl = '<div class="element-container" data-tab-id="%id%">\
        <div class="favicon">\
        <img src="%favIconUrl%" />\
        </div>\
    <div class="url">\
        <a href="%url%" class="tab" data-tab-id="%id%">%title%</a>\
    </div>\
    <div class="controls">\
    <a href="javascript:;" class="remove" data-tab-id="%id%">remove</a>\
    </div>\
    </div>';

    function fillTemplate(template, data) {
        $.each(data, function (key, value) {
            template = template.replace(new RegExp('%' + key + '%', 'g'), value);
        });

        return template;
    }

    chrome.extension.sendMessage({purpose:'get'}, function (response) {
        var tabs = response.tabs,
            $container = $('#container');

        $.each(tabs, function (_, tab) {
            if (!tab.url) {
                return true;
            }
            $container.append(fillTemplate(tpl, tab));
        });

    });

    $('#mainPopup').on('click', 'a.tab', function (e) {
        removeTab(this, $goTo);
    });

    $('#mainPopup').on('click', 'a.follow', $goTo);

    $('#mainPopup').on('click', 'a.remove', function (e) {
        removeTab(this);
    });


    function removeTab(element, cb) {
        var tabId = parseInt($(element).attr('data-tab-id'), 10);

        chrome.extension.sendMessage({purpose:'delete', id:tabId}, function (response) {
            $('.element-container[data-tab-id="' + tabId + '"]').remove();
            $.isFunction(cb) && cb.call(element);

            $('.element-container').length == 0 && window.close();
        });
    }

    function $goTo() {
        window.close();
        chrome.tabs.create({url:$(this).attr('href')});
    }


})