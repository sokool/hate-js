/**
 * This plugin is used together with backend implementation.
 * Main goal is to deliver javascript layer (backend response manager) for server side implementation.
 *
 * It's actually wrap MOST COMMON ajax-javascript actions to be simply managed on server side, not on client side.
 * How it works?
 *
 * 1. ie. mark  one <a>, <form>, <select>, <button> element with attribute data-ajax, <a href="/some-action" data-ajax>ClickMe</a>
 * 2. This link will be handeled as AJAX call to the server.
 * 3. On server side developer decides what action should be returned ie DialogBox with content should appear, or some HTML content should be replaced.
 *
 *  - Thanks to that - there is no need to write javascript at all.
 *
 * There is few simple implementation wrapped:
 *
 * ApplicationClient.action.dialog - managment of modal/windows throug ajax calls
 * ApplicationClient.action.html - replace, append, prepend... content to whatever visible HTML element
 * ApplicationClient.action.location - like redirects, refres, refresh some current HTML content...
 *
 */
/**
 * jQuery serializeObject
 * @copyright 2014, macek <paulmacek@gmail.com>
 * @link https://github.com/macek/jquery-serialize-object
 * @license BSD
 * @version 2.4.3
 */
(function (root, factory) {

    // AMD
    if (typeof define === "function" && define.amd) {
        define(["exports", "jquery"], function (exports, $) {
            return factory(exports, $);
        });
    }

    // CommonJS
    else if (typeof exports !== "undefined") {
        var $ = require("jquery");
        factory(exports, $);
    }

    // Browser
    else {
        factory(root, (root.jQuery || root.Zepto || root.ender || root.$));
    }

}(this, function (exports, $) {

    var patterns = {
        validate: /^[a-z_][a-z0-9_]*(?:\[(?:\d*|[a-z0-9_]+)\])*$/i,
        key: /[a-z0-9_]+|(?=\[\])/gi,
        push: /^$/,
        fixed: /^\d+$/,
        named: /^[a-z0-9_]+$/i
    };

    function FormSerializer(helper, $form) {

        // private variables
        var data = {},
            pushes = {};

        // private API
        function build(base, key, value) {
            base[key] = value;
            return base;
        }

        function makeObject(root, value) {

            var keys = root.match(patterns.key), k;

            // nest, nest, ..., nest
            while ((k = keys.pop()) !== undefined) {
                // foo[]
                if (patterns.push.test(k)) {
                    var idx = incrementPush(root.replace(/\[\]$/, ''));
                    value = build([], idx, value);
                }

                // foo[n]
                else if (patterns.fixed.test(k)) {
                    value = build([], k, value);
                }

                // foo; foo[bar]
                else if (patterns.named.test(k)) {
                    value = build({}, k, value);
                }
            }

            return value;
        }

        function incrementPush(key) {
            if (pushes[key] === undefined) {
                pushes[key] = 0;
            }
            return pushes[key]++;
        }

        function encode(pair) {
            switch ($('[name="' + pair.name + '"]', $form).attr("type")) {
                case "checkbox":
                    return pair.value === "on" ? true : pair.value;
                default:
                    return pair.value;
            }
        }

        function addPair(pair) {
            if (!patterns.validate.test(pair.name)) return this;
            var obj = makeObject(pair.name, encode(pair));
            data = helper.extend(true, data, obj);
            return this;
        }

        function addPairs(pairs) {
            if (!helper.isArray(pairs)) {
                throw new Error("formSerializer.addPairs expects an Array");
            }
            for (var i = 0, len = pairs.length; i < len; i++) {
                this.addPair(pairs[i]);
            }
            return this;
        }

        function serialize() {
            return data;
        }

        function serializeJSON() {
            return JSON.stringify(serialize());
        }

        // public API
        this.addPair = addPair;
        this.addPairs = addPairs;
        this.serialize = serialize;
        this.serializeJSON = serializeJSON;
    }

    FormSerializer.patterns = patterns;

    FormSerializer.serializeObject = function serializeObject() {
        if (this.length > 1) {
            return new Error("jquery-serialize-object can only serialize one form at a time");
        }
        return new FormSerializer($, this).
            addPairs(this.serializeArray()).
            serialize();
    };

    FormSerializer.serializeJSON = function serializeJSON() {
        if (this.length > 1) {
            return new Error("jquery-serialize-object can only serialize one form at a time");
        }
        return new FormSerializer($, this).
            addPairs(this.serializeArray()).
            serializeJSON();
    };

    if (typeof $.fn !== "undefined") {
        $.fn.serializeObject = FormSerializer.serializeObject;
        $.fn.serializeJSON = FormSerializer.serializeJSON;
    }

    exports.FormSerializer = FormSerializer;

    return FormSerializer;
}));

(function ($) {
    var actions = {
        dialog: function (options) {
            var $dialog = $('#dialog-' + options.selector);

            if ($('#dialog-' + options.selector).length == 0) {
                $dialog = $('<div></div>')
                    .attr('id', 'dialog-' + options.selector);
            }
            $dialog.dialog(options.options).html(options.content);
        },
        html: function (options) {
            var $contentElement = $(options.selector);

            $contentElement[options.type](options.content);
        },
        location: function (options) {
            if (options.url !== null && options.method === 'redirect') {
                location.href = options.url;
            }
            else if (options.method === 'reload') {
                location[options.method]();
            }
            else if (options.method === 'refresh') {
                var $content = $(options.selector);
                $.ajax({
                    url: $content.data('ajax'),
                    dataType: 'json'
                });
            }
        }
    };

    var listeners = {
        postLink: function ($element, options) {
            $element.on('click', function (event) {
                event.preventDefault();
                console.log(options);
//                console.log($element.serializeURLParams());

            });
        },
        a: function ($element, options) {
            $element.on('click', function (event) {
                event.preventDefault();

                var url = options.hasOwnProperty('url') ? options.url : $element.attr('href');

                $.ajax({
                    url: url,
                    type: 'get',
                    dataType: 'json'
                });

            });
        },
        form: function ($element, options) {
            $element.on('submit', function (event) {
                event.preventDefault();
                $.ajax({
                    url: $element.attr('action'),
                    type: $element.attr('method'),
                    data: $element.serializeObject(),
                    dataType: 'json'
                });
            });
        }
    };

    var methods = {
        init: function (options) {

            $('[data-toggle="hate-js"]').each(function (index, element) {
                var $element = $(element);
                var $elementOptions = $element.data('options') != null ? $element.data('options') : {};
                var $listenerMethod = $elementOptions.hasOwnProperty('listener') ? $elementOptions.listener : $element.prop('tagName').toLowerCase();

                if (listeners.hasOwnProperty($listenerMethod)) {
                    listeners[$listenerMethod]($element, $elementOptions);
                }
            });

        },

        registerAction: function (option) {
            actions[option.name] = option.action;
        },

        registerListener: function (option) {
            listeners[option.name] = option.action;
        }
    };

    function responseManager(actionCollection, settings) {
        $.each(actionCollection, function (index, option) {
            option.xhr = settings;
            if (actions.hasOwnProperty(option.action)) {
                actions[option.action].apply(this, [option]);
            }
        });
    }

    $(document).ajaxSuccess(function (event, xhr, settings) {
        var $type = xhr.getResponseHeader('Content-Type');
        if ($type.indexOf('application/json') !== -1) {
            var $response = JSON.parse(xhr.responseText);
            if ($response.hasOwnProperty('application-client')) {
                responseManager($response['application-client'], settings);
            }
        } else if ($type.indexOf('application/pdf') !== -1) {
            var $response = xhr.responseText;
        } else {

        }
    });
    $(document).ajaxSend(function () {
        $('html').addClass('waiting');
    });
    $(document).ajaxComplete(function () {
        $('html').removeClass('waiting');
    });
    $(document).ajaxError(function () {
        $('html').removeClass('error');
    });

    $.fn.applicationClient = function (method) {
        if (methods[method]) {
            methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            methods['init'].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        return this;

    };

})(jQuery);

$(document).ready(function () {
    $(document).applicationClient();
    $(document).applicationClient('registerAction', {
        name: 'testowa',
        action: function (options) {
            alert(options.content);
        }
    });
});
