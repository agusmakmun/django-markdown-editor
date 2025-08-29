/**
 * Name         : Martor v1.6.45 (Tailwind CSS Version)
 * Created by   : Agus Makmun (Summon Agus)
 * Release date : 15-Nov-2024
 * License      : GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007
 * Repository   : https://github.com/agusmakmun/django-markdown-editor
 * Theme        : Tailwind CSS
**/

(function ($) {
    if (!$) {
        $ = django.jQuery;
    }
    $.fn.martor = function () {
        $('.martor').trigger('martor.init');

        // CSRF code
        var getCookie = function (name) {
            var cookieValue = null;
            var i = 0;
            if (document.cookie && document.cookie !== '') {
                var cookies = document.cookie.split(';');
                for (i; i < cookies.length; i++) {
                    var cookie = jQuery.trim(cookies[i]);
                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) === (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        };

        // Tailwind-specific utility functions
        var TailwindUtils = {
            showElement: function(element) {
                $(element).removeClass('hidden').addClass('block');
            },
            hideElement: function(element) {
                $(element).removeClass('block').addClass('hidden');
            },
            showModal: function(element) {
                $(element).removeClass('hidden').addClass('flex');
                $('body').addClass('overflow-hidden');
            },
            hideModal: function(element) {
                $(element).removeClass('flex').addClass('hidden');
                $('body').removeClass('overflow-hidden');
            },
            toggleTab: function(activeTab, activeContent, inactiveTabs, inactiveContents) {
                // Hide all tabs and contents
                $(inactiveTabs).removeClass('border-b-2 border-gray-800 text-gray-700').addClass('text-gray-500');
                $(inactiveContents).removeClass('block').addClass('hidden');

                // Show active tab and content
                $(activeTab).removeClass('text-gray-500').addClass('border-b-2 border-gray-800 text-gray-700');
                $(activeContent).removeClass('hidden').addClass('block');
            }
        };

        // Each multiple editor fields
        this.each(function (i, obj) {
            var mainMartor = $(obj);
            var field_name = mainMartor.data('field-name');
            var textareaId = $('#id_' + field_name);
            var editorId = 'martor-' + field_name;
            var editor = ace.edit(editorId);
            var editorConfig = JSON.parse(textareaId.data('enable-configs').replace(/'/g, '"'));

            editor.setTheme('ace/theme/github');
            editor.getSession().setMode('ace/mode/markdown');
            editor.getSession().setUseWrapMode(true);
            editor.$blockScrolling = Infinity; // prevents ace from logging annoying warnings
            editor.renderer.setScrollMargin(10, 10); // set padding
            editor.setAutoScrollEditorIntoView(true);
            editor.setShowPrintMargin(false);
            editor.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true,
                enableLiveAutocompletion: true,
                enableMultiselect: false
            });

            if (editorConfig.living == 'true') {
                $(obj).addClass('enable-living');
            }

            var emojiWordCompleter = {
                getCompletions: function (editor, session, pos, prefix, callback) {
                    var wordList = typeof (emojis) != "undefined" ? emojis : []; // from `atwho/emojis.min.js`
                    var obj = editor.getSession().getTokenAt(pos.row, pos.column.count);
                    if (typeof (obj.value) != "undefined") {
                        var curTokens = obj.value.split(/\s+/);
                        var lastToken = curTokens[curTokens.length - 1];

                        if (lastToken[0] == ':') {
                            callback(null, wordList.map(function (word) {
                                return {
                                    caption: word,
                                    value: word.replace(':', '') + ' ',
                                    meta: 'emoji' // this should return as text only.
                                };
                            }));
                        }
                    }
                }
            }
            var mentionWordCompleter = {
                getCompletions: function (editor, session, pos, prefix, callback) {
                    var obj = editor.getSession().getTokenAt(pos.row, pos.column.count);
                    if (typeof (obj.value) != "undefined") {
                        var curTokens = obj.value.split(/\s+/);
                        var lastToken = curTokens[curTokens.length - 1];

                        if (lastToken[0] == '@' && lastToken[1] == '[') {
                            username = lastToken.replace(/([\@\[/\]/])/g, '');
                            $.ajax({
                                url: textareaId.data('search-users-url'),
                                data: {
                                    'username': username,
                                    'csrfmiddlewaretoken': getCookie('csrftoken')
                                },
                                success: function (data) {
                                    if (data['status'] == 200) {
                                        var wordList = [];
                                        for (var i = 0; i < data['data'].length; i++) {
                                            wordList.push(data['data'][i].username)
                                        }
                                        callback(null, wordList.map(function (word) {
                                            return {
                                                caption: word,
                                                value: word,
                                                meta: 'username'
                                            };
                                        }));
                                    }
                                }// end success
                            });
                        }
                    }
                }
            }

            // Set autocomplete for ace editor
            if (editorConfig.mention === 'true') {
                editor.completers = [emojiWordCompleter, mentionWordCompleter]
            } else {
                editor.completers = [emojiWordCompleter]
            }

            // set css `display:none` for this textarea.
            textareaId.attr({ 'style': 'display:none' });

            // assign all `field_name`, uses for a per-single editor.
            $(obj).find('.martor-toolbar').find('.markdown-selector').attr({ 'data-field-name': field_name });
            $(obj).find('.upload-progress').attr({ 'data-field-name': field_name });
            $(obj).find('.modal-help-guide').attr({ 'data-field-name': field_name });
            $(obj).find('.modal-emoji').attr({ 'data-field-name': field_name });

            // Set if editor has changed.
            editor.on('change', function (evt) {
                var value = editor.getValue();
                textareaId.val(value);
            });

            // update the preview if this menu is clicked
            var currentTab = $('#preview-content-' + field_name);
            var editorTabButton = $('.tab-editor-' + field_name);
            var previewTabButton = $('.tab-preview-' + field_name);
            var toolbarButtons = $(this).closest('.tab-martor-menu').find('.martor-toolbar');

            // Tailwind-specific tab handling
            $('.tab-editor-' + field_name).click(function() {
                var editorContent = $('#editor-content-' + field_name);
                var previewContent = $('#preview-content-' + field_name);
                var previewTab = $('.tab-preview-' + field_name);

                TailwindUtils.toggleTab(
                    this,
                    editorContent,
                    previewTab,
                    previewContent
                );

                // show the `.martor-toolbar` for this current editor if under preview.
                $(this).closest('.tab-martor-menu').find('.martor-toolbar').show();
            });

            $('.tab-preview-' + field_name).click(function() {
                var editorContent = $('#editor-content-' + field_name);
                var previewContent = $('#preview-content-' + field_name);
                var editorTab = $('.tab-editor-' + field_name);

                TailwindUtils.toggleTab(
                    this,
                    previewContent,
                    editorTab,
                    editorContent
                );

                // hide the `.martor-toolbar` when activating tab preview.
                $(this).closest('.tab-martor-menu').find('.martor-toolbar').hide();
                refreshPreview();
            });

            var refreshPreview = function () {
                var value = textareaId.val();
                var form = new FormData();
                form.append('content', value);
                form.append('csrfmiddlewaretoken', getCookie('csrftoken'));
                currentTab.addClass('martor-preview-stale');

                $.ajax({
                    url: textareaId.data('markdownfy-url'),
                    type: 'POST',
                    data: form,
                    processData: false,
                    contentType: false,
                    success: function (response) {
                        if (response) {
                            currentTab.html(response).removeClass('martor-preview-stale');
                            currentTab.addClass('martor-preview');
                            $(document).trigger('martor:preview', [currentTab]);

                            if (editorConfig.hljs == 'true') {
                                $('pre').each(function (i, block) {
                                    hljs.highlightBlock(block);
                                });
                            }
                        } else {
                            currentTab.html('<p class="text-gray-500">Nothing to preview</p>');
                        }
                    },
                    error: function (response) {
                        console.log("error", response);
                    }
                });
            };

            let timeoutID;

            var refreshPreviewTimeout = function () {
                if (timeoutID) {
                    clearTimeout(timeoutID);
                }
                timeoutID = setTimeout(refreshPreview, textareaId.data("save-timeout"));
            }

            // Refresh the preview unconditionally on first load.
            window.onload = function () {
                refreshPreview();
            };

            if (editorConfig.living !== 'true') {
                previewTabButton.click(function () {
                    // hide the `.martor-toolbar` for this current editor if under preview.
                    toolbarButtons.hide();
                    refreshPreview();
                });
            } else {
                editor.on('change', refreshPreviewTimeout);
            }

            // spellcheck
            if (editorConfig.spellcheck == 'true') {
                try {
                    enable_spellcheck(editorId);
                } catch (e) {
                    console.log("Spellcheck lib doesn't installed.");
                }
            }



            if (editorConfig.emoji == 'true') {
                langTools = ace.require("ace/ext/language_tools");
                langTools.addCompleter(emojiWordCompleter);
            }

            if (editorConfig.mention == 'true') {
                langTools = ace.require("ace/ext/language_tools");
                langTools.addCompleter(mentionWordCompleter);
            }



            // Handle toolbar dropdowns for Tailwind
            $('.martor-toolbar .dropdown').each(function() {
                var dropdown = $(this);
                var toggle = dropdown.find('.dropdown-toggle');
                var menu = dropdown.find('.dropdown-menu');

                toggle.click(function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    // Close other dropdowns
                    $('.martor-toolbar .dropdown-menu').not(menu).addClass('hidden');

                    // Toggle current dropdown
                    menu.toggleClass('hidden');
                });

                // Close dropdown when clicking outside
                $(document).click(function(e) {
                    if (!dropdown.is(e.target) && dropdown.has(e.target).length === 0) {
                        menu.addClass('hidden');
                    }
                });
            });

            // Modal Popup for Help Guide & Emoji Cheat Sheet
            $('.markdown-help[data-field-name=' + field_name + ']').click(function () {
                TailwindUtils.showModal('.modal-help-guide[data-field-name=' + field_name + ']');
            });

            // Close modal functionality
            $('.modal-help-guide[data-field-name=' + field_name + '] .modal-close').click(function () {
                TailwindUtils.hideModal('.modal-help-guide[data-field-name=' + field_name + ']');
            });

            // Toggle editor, preview, maximize
            var martorField = $('.martor-field-' + field_name);
            var btnToggleMaximize = $('.markdown-toggle-maximize[data-field-name=' + field_name + ']');

            // Toggle maximize and minimize
            var handleToggleMinimize = function () {
                $(document.body).removeClass('overflow-hidden');
                $(this).attr({ 'title': 'Full Screen' });
                $(this).find('svg.bi-arrows-angle-expand').removeClass('hidden');
                $(this).find('svg.bi-arrows-angle-contract').addClass('hidden');
                $('.main-martor-fullscreen').find('.martor-preview').removeAttr('style');
                mainMartor.removeClass('main-martor-fullscreen');
                martorField.removeAttr('style');
                editor.resize();
            }
            var handleToggleMaximize = function (selector) {
                selector.attr({ 'title': 'Minimize' });
                selector.find('svg.bi-arrows-angle-expand').addClass('hidden');
                selector.find('svg.bi-arrows-angle-contract').removeClass('hidden');
                mainMartor.addClass('main-martor-fullscreen');

                var clientHeight = document.body.clientHeight - 90;
                martorField.attr({ 'style': 'height:' + clientHeight + 'px' });

                var preview = $('.main-martor-fullscreen').find('.martor-preview');
                preview.attr({ 'style': 'overflow-y: auto;height:' + clientHeight + 'px' });

                editor.resize();
                selector.one('click', handleToggleMinimize);
                $(document.body).addClass('overflow-hidden');
            }
            btnToggleMaximize.on('click', function () {
                handleToggleMaximize($(this));
            });

            // Exit full screen when `ESC` is pressed.
            $(document).keyup(function (e) {
                if (e.keyCode == 27 && mainMartor.hasClass('main-martor-fullscreen')) {
                    btnToggleMaximize.trigger('click');
                }
            });

            // markdown insert emoji from the modal
            $('.markdown-emoji[data-field-name=' + field_name + ']').click(function () {
                var modalEmoji = $('.modal-emoji[data-field-name=' + field_name + ']');
                TailwindUtils.showModal(modalEmoji);
                var emojiList = typeof (emojis) != "undefined" ? emojis : []; // from `plugins/js/emojis.min.js`
                var segmentEmoji = modalEmoji.find('.emoji-content-body');
                var loaderInit = modalEmoji.find('.emoji-loader-init');

                // setup initial loader
                segmentEmoji.html('');
                TailwindUtils.showElement(loaderInit);

                    for (var i = 0; i < emojiList.length; i++) {
                        var linkEmoji = textareaId.data('base-emoji-url') + emojiList[i].replace(/:/g, '') + '.png';
                    segmentEmoji.append(''
                        + '<div class="inline-block p-2">'
                        + '<a data-emoji-target="' + emojiList[i] + '" class="insert-emoji">'
                        + '<img class="w-5 h-5" src="' + linkEmoji + '"> ' + emojiList[i]
                        + '</a></div>');
                        $('a[data-emoji-target="' + emojiList[i] + '"]').click(function () {
                            markdownToEmoji(editor, $(this).data('emoji-target'));
                            TailwindUtils.hideModal(modalEmoji);
                        });
                    }

                    TailwindUtils.hideElement(loaderInit);
                    TailwindUtils.showElement(segmentEmoji);
            });

            // Close emoji modal
            $('.modal-emoji[data-field-name=' + field_name + '] .modal-close').click(function () {
                TailwindUtils.hideModal('.modal-emoji[data-field-name=' + field_name + ']');
            });

            // Set initial value if has the content before.
            editor.setValue(textareaId.val(), -1);



            // win/linux: Ctrl+B, mac: Command+B
            var markdownToBold = function (editor) {
                var originalRange = editor.getSelectionRange();
                if (editor.selection.isEmpty()) {
                    var curpos = editor.getCursorPosition();
                    editor.session.insert(curpos, ' **** ');
                    editor.focus();
                    editor.selection.moveTo(curpos.row, curpos.column + 3);
                } else {
                    var range = editor.getSelectionRange();
                    var text = editor.session.getTextRange(range);
                    editor.session.replace(range, '**' + text + '**');
                    originalRange.end.column += 4; // this because injected from 4 `*` characters.
                    editor.focus();
                    editor.selection.setSelectionRange(originalRange);
                }
            };
            // win/linux: Ctrl+I, mac: Command+I
            var markdownToItalic = function (editor) {
                var originalRange = editor.getSelectionRange();
                if (editor.selection.isEmpty()) {
                    var curpos = editor.getCursorPosition();
                    editor.session.insert(curpos, ' __ ');
                    editor.focus();
                    editor.selection.moveTo(curpos.row, curpos.column + 2);
                } else {
                    var range = editor.getSelectionRange();
                    var text = editor.session.getTextRange(range);
                    editor.session.replace(range, '_' + text + '_');
                    originalRange.end.column += 2; // this because injected from 2 `_` characters.
                    editor.focus();
                    editor.selection.setSelectionRange(originalRange);
                }
            };
            // win/linux: Ctrl+Shift+U, mac: Command+Shift+U
            var markdownToUnderscores = function (editor) {
                var originalRange = editor.getSelectionRange();
                if (editor.selection.isEmpty()) {
                    var curpos = editor.getCursorPosition();
                    editor.session.insert(curpos, ' ++++ ');
                    editor.focus();
                    editor.selection.moveTo(curpos.row, curpos.column + 3);
                } else {
                    var range = editor.getSelectionRange();
                    var text = editor.session.getTextRange(range);
                    editor.session.replace(range, '++' + text + '++');
                    originalRange.end.column += 4; // this because injected from 4 `*` characters.
                    editor.focus();
                    editor.selection.setSelectionRange(originalRange);
                }
            };
            // win/linux: Ctrl+Shift+S, mac: Command+Shift+S
            var markdownToStrikethrough = function (editor) {
                var originalRange = editor.getSelectionRange();
                if (editor.selection.isEmpty()) {
                    var curpos = editor.getCursorPosition();
                    editor.session.insert(curpos, ' ~~~~ ');
                    editor.focus();
                    editor.selection.moveTo(curpos.row, curpos.column + 3);
                } else {
                    var range = editor.getSelectionRange();
                    var text = editor.session.getTextRange(range);
                    editor.session.replace(range, '~~' + text + '~~');
                    originalRange.end.column += 4; // this because injected from 4 `*` characters.
                    editor.focus();
                    editor.selection.setSelectionRange(originalRange);
                }
            };
            // win/linux: Ctrl+H, mac: Command+H
            var markdownToHorizontal = function (editor) {
                var originalRange = editor.getSelectionRange();
                if (editor.selection.isEmpty()) {
                    var curpos = editor.getCursorPosition();
                    editor.session.insert(curpos, '\n\n----------\n\n');
                    editor.focus();
                    editor.selection.moveTo(curpos.row + 4, curpos.column + 10);
                }
                else {
                    var range = editor.getSelectionRange();
                    var text = editor.session.getTextRange(range);
                    editor.session.replace(range, '\n\n----------\n\n' + text);
                    editor.focus();
                    editor.selection.moveTo(
                        originalRange.end.row + 4,
                        originalRange.end.column + 10
                    );
                }
            };
            // win/linux: Ctrl+Alt+1, mac: Command+Option+1
            var markdownToH1 = function (editor) {
                var originalRange = editor.getSelectionRange();
                if (editor.selection.isEmpty()) {
                    var curpos = editor.getCursorPosition();
                    editor.session.insert(curpos, '\n\n# ');
                    editor.focus();
                    editor.selection.moveTo(curpos.row + 2, curpos.column + 2);
                }
                else {
                    var range = editor.getSelectionRange();
                    var text = editor.session.getTextRange(range);
                    editor.session.replace(range, '\n\n# ' + text + '\n');
                    editor.focus();
                    editor.selection.moveTo(
                        originalRange.end.row + 2,
                        originalRange.end.column + 2
                    );
                }
            };
            // win/linux: Ctrl+Alt+2, mac: Command+Option+2
            var markdownToH2 = function (editor) {
                var originalRange = editor.getSelectionRange();
                if (editor.selection.isEmpty()) {
                    var curpos = editor.getCursorPosition();
                    editor.session.insert(curpos, '\n\n## ');
                    editor.focus();
                    editor.selection.moveTo(curpos.row + 2, curpos.column + 3);
                }
                else {
                    var range = editor.getSelectionRange();
                    var text = editor.session.getTextRange(range);
                    editor.session.replace(range, '\n\n## ' + text + '\n');
                    editor.focus();
                    editor.selection.moveTo(
                        originalRange.end.row + 2,
                        originalRange.end.column + 3
                    );
                }
            };
            // win/linux: Ctrl+Alt+3, mac: Command+Option+3
            var markdownToH3 = function (editor) {
                var originalRange = editor.getSelectionRange();
                if (editor.selection.isEmpty()) {
                    var curpos = editor.getCursorPosition();
                    editor.session.insert(curpos, '\n\n### ');
                    editor.focus();
                    editor.selection.moveTo(curpos.row + 2, curpos.column + 4);
                }
                else {
                    var range = editor.getSelectionRange();
                    var text = editor.session.getTextRange(range);
                    editor.session.replace(range, '\n\n### ' + text + '\n');
                    editor.focus();
                    editor.selection.moveTo(
                        originalRange.end.row + 2,
                        originalRange.end.column + 4
                    );
                }
            };
            // win/linux: Ctrl+Alt+P, mac: Command+Option+P
            var markdownToPre = function (editor) {
                var originalRange = editor.getSelectionRange();
                if (editor.selection.isEmpty()) {
                    var curpos = editor.getCursorPosition();
                    editor.session.insert(curpos, '\n\n```\n\n```\n');
                    editor.focus();
                    editor.selection.moveTo(curpos.row + 3, curpos.column);
                }
                else {
                    var range = editor.getSelectionRange();
                    var text = editor.session.getTextRange(range);
                    editor.session.replace(range, '\n\n```\n' + text + '\n```\n');
                    editor.focus();
                    editor.selection.moveTo(
                        originalRange.end.row + 3,
                        originalRange.end.column + 3
                    );
                }
            };
            // win/linux: Ctrl+Alt+C, mac: Command+Option+C
            var markdownToCode = function (editor) {
                var originalRange = editor.getSelectionRange();
                if (editor.selection.isEmpty()) {
                    var curpos = editor.getCursorPosition();
                    editor.session.insert(curpos, ' `` ');
                    editor.focus();
                    editor.selection.moveTo(curpos.row, curpos.column + 2);
                } else {
                    var range = editor.getSelectionRange();
                    var text = editor.session.getTextRange(range);
                    editor.session.replace(range, '`' + text + '`');
                    originalRange.end.column += 2; // this because injected from 2 `_` characters.
                    editor.focus();
                    editor.selection.setSelectionRange(originalRange);
                }
            };
            // win/linux: Ctrl+Q, mac: Command+Shift+K
            var markdownToBlockQuote = function (editor) {
                var originalRange = editor.getSelectionRange();
                if (editor.selection.isEmpty()) {
                    var curpos = editor.getCursorPosition();
                    editor.session.insert(curpos, '\n\n> \n');
                    editor.focus();
                    editor.selection.moveTo(curpos.row + 2, curpos.column + 2);
                }
                else {
                    var range = editor.getSelectionRange();
                    var text = editor.session.getTextRange(range);
                    editor.session.replace(range, '\n\n> ' + text + '\n');
                    editor.focus();
                    editor.selection.moveTo(
                        originalRange.end.row + 2,
                        originalRange.end.column + 2
                    );
                }
            };
            // win/linux: Ctrl+U, mac: Command+U
            var markdownToUnorderedList = function (editor) {
                var originalRange = editor.getSelectionRange();
                if (editor.selection.isEmpty()) {
                    var curpos = editor.getCursorPosition();
                    editor.session.insert(curpos, '\n\n* ');
                    editor.focus();
                    editor.selection.moveTo(curpos.row + 2, curpos.column + 2);
                }
                else {
                    var range = editor.getSelectionRange();
                    var text = editor.session.getTextRange(range);
                    editor.session.replace(range, '\n\n* ' + text);
                    editor.focus();
                    editor.selection.moveTo(
                        originalRange.end.row + 2,
                        originalRange.end.column + 2
                    );
                }
            };
            // win/linux: Ctrl+Shift+O, mac: Command+Option+O
            var markdownToOrderedList = function (editor) {
                var originalRange = editor.getSelectionRange();
                if (editor.selection.isEmpty()) {
                    var curpos = editor.getCursorPosition();
                    editor.session.insert(curpos, '\n\n1. ');
                    editor.focus();
                    editor.selection.moveTo(curpos.row + 2, curpos.column + 3);
                }
                else {
                    var range = editor.getSelectionRange();
                    var text = editor.session.getTextRange(range);
                    editor.session.replace(range, '\n\n1. ' + text);
                    editor.focus();
                    editor.selection.moveTo(
                        originalRange.end.row + 2,
                        originalRange.end.column + 3
                    );
                }
            };
            // win/linux: Ctrl+L, mac: Command+L
            var markdownToLink = function (editor) {
                var originalRange = editor.getSelectionRange();
                if (editor.selection.isEmpty()) {
                    var curpos = editor.getCursorPosition();
                    editor.session.insert(curpos, ' [](https://) ');
                    editor.focus();
                    editor.selection.moveTo(curpos.row, curpos.column + 2);
                } else {
                    var range = editor.getSelectionRange();
                    var text = editor.session.getTextRange(range);
                    editor.session.replace(range, '[' + text + '](https://) ');
                    editor.focus();
                    editor.selection.moveTo(
                        originalRange.end.row,
                        originalRange.end.column + 11
                    );
                }
            };
            // win/linux: Ctrl+Shift+I, mac: Command+Option+I
            // or via upload: imageData={name:null, link:null}
            var markdownToImageLink = function (editor, imageData) {
                var originalRange = editor.getSelectionRange();
                if (typeof (imageData) === 'undefined') {
                    if (editor.selection.isEmpty()) {
                        var curpos = editor.getCursorPosition();
                        editor.session.insert(curpos, ' ![](https://) ');
                        editor.focus();
                        editor.selection.moveTo(curpos.row, curpos.column + 3);
                    } else {
                        var range = editor.getSelectionRange();
                        var text = editor.session.getTextRange(range);
                        editor.session.replace(range, '![' + text + '](https://) ');
                        editor.focus();
                        editor.selection.moveTo(
                            originalRange.end.row,
                            originalRange.end.column + 12
                        );
                    }
                } else { // this if use image upload to imgur.
                    var curpos = editor.getCursorPosition();
                    editor.session.insert(curpos, '![' + imageData.name + '](' + imageData.link + ') ');
                    editor.focus();
                    editor.selection.moveTo(
                        curpos.row,
                        curpos.column + imageData.name.length + 2
                    );
                }
            };
            // win/linux: Ctrl+M, mac: Command+M
            var markdownToMention = function (editor) {
                var originalRange = editor.getSelectionRange();
                if (editor.selection.isEmpty()) {
                    var curpos = editor.getCursorPosition();
                    editor.session.insert(curpos, ' @[]');
                    editor.focus();
                    editor.selection.moveTo(curpos.row, curpos.column + 3);
                } else {
                    var range = editor.getSelectionRange();
                    var text = editor.session.getTextRange(range);
                    editor.session.replace(range, '@[' + text + ']');
                    editor.focus();
                    editor.selection.moveTo(
                        originalRange.end.row,
                        originalRange.end.column + 3
                    )
                }
            };
            // Insert Emoji to text editor: $('.insert-emoji').data('emoji-target')
            var markdownToEmoji = function (editor, data_target) {
                var curpos = editor.getCursorPosition();
                editor.session.insert(curpos, ' ' + data_target + ' ');
                editor.focus();
                editor.selection.moveTo(curpos.row, curpos.column + data_target.length + 2);
            };
            // Markdown Image Uploader auto insert to editor.
            // with special insert, eg: ![avatar.png](i.imgur.com/DytfpTz.png)
            var markdownToUploadImage = function (editor) {
                var firstForm = $('#' + editorId).closest('form').get(0);
                var field_name = editor.container.id.replace('martor-', '');
                var form = new FormData(firstForm);
                form.append('csrfmiddlewaretoken', getCookie('csrftoken'));

                $.ajax({
                    url: textareaId.data('upload-url'),
                    type: 'POST',
                    data: form,
                    async: true,
                    cache: false,
                    contentType: false,
                    enctype: 'multipart/form-data',
                    processData: false,
                    beforeSend: function () {
                        console.log('Uploading...');
                        $('.upload-progress[data-field-name=' + field_name + ']').show();
                    },
                    success: function (response) {
                        $('.upload-progress[data-field-name=' + field_name + ']').hide();
                        if (response.status == 200) {
                            console.log(response);
                            markdownToImageLink(
                                editor = editor,
                                imageData = { name: response.name, link: response.link }
                            );
                        } else {
                            alert(response.error);
                        }
                    },
                    error: function (response) {
                        console.log("error", response);
                        $('.upload-progress[data-field-name=' + field_name + ']').hide();
                    }
                });
                return false;
            };

            // Trigger Click
            $('.markdown-bold[data-field-name=' + field_name + ']').click(function () {
                markdownToBold(editor);
            });
            $('.markdown-italic[data-field-name=' + field_name + ']').click(function () {
                markdownToItalic(editor);
            });
            $('.markdown-horizontal[data-field-name=' + field_name + ']').click(function () {
                markdownToHorizontal(editor);
            });
            $('.markdown-h1[data-field-name=' + field_name + ']').click(function () {
                markdownToH1(editor);
            });
            $('.markdown-h2[data-field-name=' + field_name + ']').click(function () {
                markdownToH2(editor);
            });
            $('.markdown-h3[data-field-name=' + field_name + ']').click(function () {
                markdownToH3(editor);
            });
            $('.markdown-pre[data-field-name=' + field_name + ']').click(function () {
                markdownToPre(editor);
            });
            $('.markdown-code[data-field-name=' + field_name + ']').click(function () {
                markdownToCode(editor);
            });
            $('.markdown-blockquote[data-field-name=' + field_name + ']').click(function () {
                markdownToBlockQuote(editor);
            });
            $('.markdown-unordered-list[data-field-name=' + field_name + ']').click(function () {
                markdownToUnorderedList(editor);
            });
            $('.markdown-ordered-list[data-field-name=' + field_name + ']').click(function () {
                markdownToOrderedList(editor);
            });
            $('.markdown-link[data-field-name=' + field_name + ']').click(function () {
                markdownToLink(editor);
            });
            $('.markdown-image-link[data-field-name=' + field_name + ']').click(function () {
                markdownToImageLink(editor);
            });

            // Custom decission for toolbar buttons.
            var btnMention = $('.markdown-direct-mention[data-field-name=' + field_name + ']');  // To Direct Mention
            var btnUpload = $('.markdown-image-upload[data-field-name=' + field_name + ']');     // To Upload Image

            if (editorConfig.mention == 'true') {
                btnMention.click(function () {
                    markdownToMention(editor);
                });
            } else {
                btnMention.remove();
                // Disable help of `mention`
                $('.markdown-reference tbody tr')[1].remove();
            }

            if (editorConfig.imgur == 'true') {
                btnUpload.on('change', function (evt) {
                    evt.preventDefault();
                    markdownToUploadImage(editor);
                });
            } else {
                btnUpload.remove();
            }

            // Trigger Keyboards
            editor.commands.addCommand({
                name: 'markdownToBold',
                bindKey: { win: 'Ctrl-B', mac: 'Command-B' },
                exec: function (editor) {
                    markdownToBold(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToItalic',
                bindKey: { win: 'Ctrl-I', mac: 'Command-I' },
                exec: function (editor) {
                    markdownToItalic(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToUnderscores',
                bindKey: { win: 'Ctrl-Shift-U', mac: 'Command-Shift-U' },
                exec: function (editor) {
                    markdownToUnderscores(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToStrikethrough',
                bindKey: { win: 'Ctrl-Shift-S', mac: 'Command-Shift-S' },
                exec: function (editor) {
                    markdownToStrikethrough(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToHorizontal',
                bindKey: { win: 'Ctrl-H', mac: 'Command-H' },
                exec: function (editor) {
                    markdownToHorizontal(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToH1',
                bindKey: { win: 'Ctrl-Alt-1', mac: 'Command-Option-1' },
                exec: function (editor) {
                    markdownToH1(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToH2',
                bindKey: { win: 'Ctrl-Alt-2', mac: 'Command-Option-3' },
                exec: function (editor) {
                    markdownToH2(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToH3',
                bindKey: { win: 'Ctrl-Alt-3', mac: 'Command-Option-3' },
                exec: function (editor) {
                    markdownToH3(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToPre',
                bindKey: { win: 'Ctrl-Alt-P', mac: 'Command-Option-P' },
                exec: function (editor) {
                    markdownToPre(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToCode',
                bindKey: { win: 'Ctrl-Alt-C', mac: 'Command-Option-C' },
                exec: function (editor) {
                    markdownToCode(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToBlockQuote',
                bindKey: { win: 'Ctrl-Q', mac: 'Command-Shift-K' },
                exec: function (editor) {
                    markdownToBlockQuote(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToUnorderedList',
                bindKey: { win: 'Ctrl-U', mac: 'Command-U' },
                exec: function (editor) {
                    markdownToUnorderedList(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToOrderedList',
                bindKey: { win: 'Ctrl-Shift+O', mac: 'Command-Option-O' },
                exec: function (editor) {
                    markdownToOrderedList(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToLink',
                bindKey: { win: 'Ctrl-L', mac: 'Command-L' },
                exec: function (editor) {
                    markdownToLink(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToImageLink',
                bindKey: { win: 'Ctrl-Shift-I', mac: 'Command-Option-I' },
                exec: function (editor) {
                    markdownToImageLink(editor);
                },
                readOnly: true
            });
            if (editorConfig.mention === 'true') {
            editor.commands.addCommand({
                    name: 'markdownToMention',
                bindKey: { win: 'Ctrl-M', mac: 'Command-M' },
                    exec: function (editor) {
                        markdownToMention(editor);
                    },
                    readOnly: true
                });
            }
        });
    };

    $(function () {
        $('.main-martor').martor();
    });

    if ('django' in window && 'jQuery' in window.django)
        django.jQuery(document).on('formset:added', function (event) {
            // add delay for formset to load
            setTimeout(function(){
                var row = $(event.target);
                row.find('.main-martor').each(function () {
                    var id = row.attr('id');
                    id = id.substr(id.lastIndexOf('-') + 1);
                    // Notice here we are using our jQuery instead of Django's.
                    // This is because plugins are only loaded for ours.
                    var fixed = $(this.outerHTML.replace(/__prefix__/g, id));
                    $(this).replaceWith(fixed);
                    fixed.martor();
                });
            }, 1000);
        });
})(jQuery);
