$(function() {

    var tpl = '<div class="element-container">\
        <div class="favicon">\
        <img src="%favIconUrl%" />\
        </div>\
    <div class="url">\
        <a href="%url%">%title%</a>\
    </div>\
    </div>';

    function fillTemplate(template, data) {
        console.log(data);
        $.each(data, function(key, value) {
            template = template.replace('%' + key + '%', value);
        });

        return template;
    }

    chrome.extension.sendMessage({}, function(response) {
        var tabs = response.tabs,
            $container = $('#container');

        $.each(tabs, function(_, tab) {
            if (!tab.url) {
                return true;
            }
            $container.append(fillTemplate(tpl, tab));
        });

    });

    $('#container').on('click', 'a', function(e) {
        e.preventDefault();
        chrome.tabs.create({url:$(this).attr('href')});
    });


})