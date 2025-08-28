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
                                            wordList.push('@[' + data['data'][i] + ']')
                                        }
                                        callback(null, wordList.map(function (word) {
                                            return {
                                                caption: word,
                                                value: word + ' ',
                                                meta: 'users'
                                            };
                                        }));
                                    }
                                }
                            });
                        }
                    }
                }
            }

            // assign all `field_name`, uses for a per-single editor.
            $(obj).find('.martor-toolbar').find('.markdown-selector').attr({ 'data-field-name': field_name });
            $(obj).find('.upload-progress').attr({ 'data-field-name': field_name });
            $(obj).find('.modal-help-guide').attr({ 'data-field-name': field_name });
            $(obj).find('.modal-emoji').attr({ 'data-field-name': field_name });

            // Set if editor has changed.
            editor.on('change', function (evt) {
                var content = editor.getSession().getValue();
                textareaId.val(content);

                // for validate markdown
                textareaId.parent().find('.invalid-feedback').remove();
                textareaId.parent().removeClass('has-error');

                // Auto update preview in realtime when editor activated
                if (editorConfig.living == 'true' && content.length > 0) {
                    var preview_tab = $('.tab-preview-' + field_name);
                    markdownfy(textareaId, preview_tab, false);
                }
            });

            // spellcheck
            if (editorConfig.spellcheck == 'true') {
                langTools = ace.require("ace/ext/language_tools");
                // NOTE: install typo.js first. https://github.com/cfinke/Typo.js
                // use `pip install typojs`
                var spellcheck = function (content) {
                    var us_dict = new Typo("en_US", false, false, { dictionaryPath: "dicts" });
                    var wordList = content.split(/\s+/);
                    var suggestions = [];

                    for (var i in wordList) {
                        var word = wordList[i];

                        // Check if our word contains a character that isn't a letter or an apostrophe.
                        var nonWord = word.match(/[^a-zA-Z']/);
                        if (!nonWord && word && !us_dict.check(word)) {
                            var sugg = us_dict.suggest(word);

                            if (sugg.length > 0) {
                                suggestions.push({
                                    word: word,
                                    suggestions: sugg
                                });
                            }
                        }
                    }

                    return suggestions;
                };

                var spellcheckCompleter = {
                    getCompletions: function (editor, session, pos, prefix, callback) {
                        var content = session.getValue();
                        var suggestions = spellcheck(content);
                        var wordList = [];

                        suggestions.forEach(function (suggestion) {
                            suggestion.suggestions.forEach(function (word) {
                                wordList.push(word);
                            });
                        });

                        callback(null, wordList.map(function (word) {
                            return {
                                caption: word,
                                value: word,
                                meta: 'spell'
                            };
                        }));
                    }
                };
                langTools.addCompleter(spellcheckCompleter);
            }

            var editorTabButton = $('.tab-editor-' + field_name);
            editorTabButton.click(function () {
                // show the `.martor-toolbar` for this current editor if under preview.
                $(this).closest('.tab-martor-menu').find('.martor-toolbar').show();
            });

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
            });

            $('.tab-preview-' + field_name).click(function() {
                var editorContent = $('#editor-content-' + field_name);
                var previewContent = '#preview-content-' + field_name;
                var editorTab = $('.tab-editor-' + field_name);

                TailwindUtils.toggleTab(
                    this,
                    previewContent,
                    editorTab,
                    editorContent
                );

                // hide the `.martor-toolbar` when activating tab preview.
                $(this).closest('.tab-martor-menu').find('.martor-toolbar').hide();
                markdownfy(textareaId, $(previewContent), true);
            });

            if (editorConfig.emoji == 'true') {
                langTools = ace.require("ace/ext/language_tools");
                langTools.addCompleter(emojiWordCompleter);
            }

            if (editorConfig.mention == 'true') {
                langTools = ace.require("ace/ext/language_tools");
                langTools.addCompleter(mentionWordCompleter);
            }

            // The Markdown function.
            function markdownfy(textareaId, previewBox, isTabPreview) {
                var text = textareaId.val();
                var isLivePreview = editorConfig.living == 'true';

                if (text.length > 0) {
                    var timeout = textareaId.data('save-timeout');
                    var markdownfyUrl = textareaId.data('markdownfy-url');

                    if (!isLivePreview && isTabPreview) {
                        previewBox.html('<p class="text-center text-gray-500 py-8">Processing...</p>');
                    }

                    setTimeout(function () {
                        $.ajax({
                            url: markdownfyUrl,
                            type: 'POST',
                            data: {
                                'content': text,
                                'csrfmiddlewaretoken': getCookie('csrftoken')
                            },
                            success: function (data) {
                                var content = data['content'];
                                previewBox.html(content);

                                // add class `.martor-preview` to applying the css.
                                previewBox.addClass('martor-preview');

                                // Scroll into bottom of preview only for non-living mode
                                if (!isLivePreview && isTabPreview) {
                                    previewBox.animate({ scrollTop: previewBox[0].scrollHeight }, 800);
                                }

                                // Re-parse highlight on preview pane again.
                                if (typeof (hljs) !== "undefined") {
                                    previewBox.find('pre code').each(function (i, block) {
                                        hljs.highlightBlock(block);
                                    });
                                }
                            }
                        });
                    }, timeout);
                } else {
                    previewBox.html('<p class="text-gray-500">Nothing to preview</p>');
                }
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
            $('.markdown-toggle-maximize[data-field-name=' + field_name + ']').click(function () {
                if ($(obj).hasClass('main-martor-fullscreen')) {
                    $(obj).removeClass('main-martor-fullscreen');
                    $('body').removeClass('overflow-hidden');
                } else {
                    $(obj).addClass('main-martor-fullscreen');
                    $('body').addClass('overflow-hidden');
                }
            });

            // markdown insert emoji from the modal
            $('.markdown-emoji[data-field-name=' + field_name + ']').click(function () {
                var modalEmoji = $('.modal-emoji[data-field-name=' + field_name + ']');
                var emojiList = typeof (emojis) != "undefined" ? emojis : []; // from `plugins/js/emojis.min.js`
                var segmentEmoji = modalEmoji.find('.emoji-content-body');
                var loaderInit = modalEmoji.find('.emoji-loader-init');

                // setup initial loader
                segmentEmoji.html('');
                TailwindUtils.showElement(loaderInit);
                TailwindUtils.showModal(modalEmoji);

                setTimeout(function() {
                    for (var i = 0; i < emojiList.length; i++) {
                        var linkEmoji = textareaId.data('base-emoji-url') + emojiList[i].replace(/:/g, '') + '.png';
                        segmentEmoji.append('<div class="inline-block p-2">'
                            + '<a href="javascript:void(0)" class="insert-emoji" data-emoji-target="' + emojiList[i] + '">'
                            + '<img class="w-5 h-5" src="' + linkEmoji + '" alt="' + emojiList[i] + '" title="' + emojiList[i] + '">'
                            + '</a>'
                            + '</div>');
                        $('a[data-emoji-target="' + emojiList[i] + '"]').click(function () {
                            markdownToEmoji(editor, $(this).data('emoji-target'));
                            TailwindUtils.hideModal(modalEmoji);
                        });
                    }
                    TailwindUtils.hideElement(loaderInit);
                    TailwindUtils.showElement(segmentEmoji);
                }, 100);
            });

            // Close emoji modal
            $('.modal-emoji[data-field-name=' + field_name + '] .modal-close').click(function () {
                TailwindUtils.hideModal('.modal-emoji[data-field-name=' + field_name + ']');
            });

            // Set initial value if has the content before.
            editor.setValue(textareaId.val(), -1);

            // Upload Image
            // reference: https://stackoverflow.com/questions/166221/how-can-i-upload-files-asynchronously
            var uploadProgress = $('.upload-progress[data-field-name=' + field_name + ']');
            $(obj).find('input[name=markdown-image-upload]').change(function () {
                if ($(this).val() === '') {
                    return;
                }

                var formData = new FormData();
                var imageName = $(this)[0].files[0].name;
                var imageFile = $(this)[0].files[0];
                var imageSize = $(this)[0].files[0].size;
                var maxFileSize = 1024 * 1024 * 10; // 10MB

                if (imageSize > maxFileSize) {
                    alert('Image size too large. Maximum file size is 10MB.');
                    return;
                }

                formData.append('markdown-image-upload', imageFile);
                formData.append('csrfmiddlewaretoken', getCookie('csrftoken'));

                TailwindUtils.showElement(uploadProgress);

                $.ajax({
                    url: textareaId.data('upload-url'),
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    beforeSend: function () {
                        uploadProgress.find('.spinner').removeClass('hidden');
                    },
                    success: function (data) {
                        if (data['status'] == 200) {
                            var imageUrl = data['image_url'];
                            markdownToImageLink(editor, imageName, imageUrl);
                        } else {
                            alert(data['error']);
                        }
                        TailwindUtils.hideElement(uploadProgress);
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        alert('Image upload failed: ' + errorThrown);
                        TailwindUtils.hideElement(uploadProgress);
                    }
                });
            });

            // All the markdowns selector object
            var MarkdownSelectors = {
                bold: function () {
                    markdownSyntaxWrap(editor, '**', '**', 'Bolded text');
                },
                italic: function () {
                    markdownSyntaxWrap(editor, '*', '*', 'Italicized text');
                },
                horizontal: function () {
                    markdownSyntaxWrap(editor, '', '\n***\n', '');
                },
                h1: function () {
                    markdownSyntaxWrap(editor, '# ', '', 'Heading 1');
                },
                h2: function () {
                    markdownSyntaxWrap(editor, '## ', '', 'Heading 2');
                },
                h3: function () {
                    markdownSyntaxWrap(editor, '### ', '', 'Heading 3');
                },
                pre: function () {
                    markdownSyntaxWrap(editor, '```\n', '\n```\n', 'Code goes here...');
                },
                code: function () {
                    markdownSyntaxWrap(editor, '`', '`', 'Code goes here...');
                },
                quote: function () {
                    markdownSyntaxWrap(editor, '> ', '', 'Quoted text');
                },
                ul: function () {
                    markdownSyntaxWrap(editor, '* ', '', 'List item');
                },
                ol: function () {
                    markdownSyntaxWrap(editor, '1. ', '', 'List item');
                },
                link: function () {
                    markdownSyntaxWrap(editor, '[', '](http://)', 'link text');
                },
                image: function () {
                    markdownSyntaxWrap(editor, '![', '](http://)', 'image text');
                },
                mention: function () {
                    markdownToDirectMention(editor);
                },
                emoji: function () {
                    $('.markdown-emoji[data-field-name=' + field_name + ']').trigger('click');
                },
                toggle: function () {
                    $('.markdown-toggle-maximize[data-field-name=' + field_name + ']').trigger('click');
                },
                help: function () {
                    $('.markdown-help[data-field-name=' + field_name + ']').trigger('click');
                }
            };

            // Markdowns selectors click events
            $(obj).find('.markdown-bold').click(function () { MarkdownSelectors.bold(); });
            $(obj).find('.markdown-italic').click(function () { MarkdownSelectors.italic(); });
            $(obj).find('.markdown-horizontal').click(function () { MarkdownSelectors.horizontal(); });
            $(obj).find('.markdown-h1').click(function () { MarkdownSelectors.h1(); });
            $(obj).find('.markdown-h2').click(function () { MarkdownSelectors.h2(); });
            $(obj).find('.markdown-h3').click(function () { MarkdownSelectors.h3(); });
            $(obj).find('.markdown-pre').click(function () { MarkdownSelectors.pre(); });
            $(obj).find('.markdown-code').click(function () { MarkdownSelectors.code(); });
            $(obj).find('.markdown-blockquote').click(function () { MarkdownSelectors.quote(); });
            $(obj).find('.markdown-unordered-list').click(function () { MarkdownSelectors.ul(); });
            $(obj).find('.markdown-ordered-list').click(function () { MarkdownSelectors.ol(); });
            $(obj).find('.markdown-link').click(function () { MarkdownSelectors.link(); });
            $(obj).find('.markdown-image-link').click(function () { MarkdownSelectors.image(); });
            $(obj).find('.markdown-direct-mention').click(function () { MarkdownSelectors.mention(); });
            $(obj).find('.markdown-emoji').click(function () { MarkdownSelectors.emoji(); });
            $(obj).find('.markdown-toggle-maximize').click(function () { MarkdownSelectors.toggle(); });
            $(obj).find('.markdown-help').click(function () { MarkdownSelectors.help(); });

            // Markdowns shorcuts key
            editor.commands.addCommand({
                name: 'bold',
                bindKey: { win: 'Ctrl-B', mac: 'Command-B' },
                exec: function (editor) { MarkdownSelectors.bold(); },
                readOnly: false
            });
            editor.commands.addCommand({
                name: 'italic',
                bindKey: { win: 'Ctrl-I', mac: 'Command-I' },
                exec: function (editor) { MarkdownSelectors.italic(); },
                readOnly: false
            });
            editor.commands.addCommand({
                name: 'horizontal',
                bindKey: { win: 'Ctrl-H', mac: 'Command-H' },
                exec: function (editor) { MarkdownSelectors.horizontal(); },
                readOnly: false
            });
            editor.commands.addCommand({
                name: 'h1',
                bindKey: { win: 'Ctrl-Alt-1', mac: 'Command-Alt-1' },
                exec: function (editor) { MarkdownSelectors.h1(); },
                readOnly: false
            });
            editor.commands.addCommand({
                name: 'h2',
                bindKey: { win: 'Ctrl-Alt-2', mac: 'Command-Alt-2' },
                exec: function (editor) { MarkdownSelectors.h2(); },
                readOnly: false
            });
            editor.commands.addCommand({
                name: 'h3',
                bindKey: { win: 'Ctrl-Alt-3', mac: 'Command-Alt-3' },
                exec: function (editor) { MarkdownSelectors.h3(); },
                readOnly: false
            });
            editor.commands.addCommand({
                name: 'pre',
                bindKey: { win: 'Ctrl-Alt-P', mac: 'Command-Alt-P' },
                exec: function (editor) { MarkdownSelectors.pre(); },
                readOnly: false
            });
            editor.commands.addCommand({
                name: 'code',
                bindKey: { win: 'Ctrl-Alt-C', mac: 'Command-Alt-C' },
                exec: function (editor) { MarkdownSelectors.code(); },
                readOnly: false
            });
            editor.commands.addCommand({
                name: 'quote',
                bindKey: { win: 'Ctrl-Q', mac: 'Command-Q' },
                exec: function (editor) { MarkdownSelectors.quote(); },
                readOnly: false
            });
            editor.commands.addCommand({
                name: 'ul',
                bindKey: { win: 'Ctrl-U', mac: 'Command-U' },
                exec: function (editor) { MarkdownSelectors.ul(); },
                readOnly: false
            });
            editor.commands.addCommand({
                name: 'ol',
                bindKey: { win: 'Ctrl-Shift-O', mac: 'Command-Shift-O' },
                exec: function (editor) { MarkdownSelectors.ol(); },
                readOnly: false
            });
            editor.commands.addCommand({
                name: 'link',
                bindKey: { win: 'Ctrl-L', mac: 'Command-L' },
                exec: function (editor) { MarkdownSelectors.link(); },
                readOnly: false
            });
            editor.commands.addCommand({
                name: 'image',
                bindKey: { win: 'Ctrl-Shift-I', mac: 'Command-Shift-I' },
                exec: function (editor) { MarkdownSelectors.image(); },
                readOnly: false
            });
            editor.commands.addCommand({
                name: 'mention',
                bindKey: { win: 'Ctrl-M', mac: 'Command-M' },
                exec: function (editor) { MarkdownSelectors.mention(); },
                readOnly: false
            });
        });

        // Global function for markdown syntax wrapping
        function markdownSyntaxWrap(editor, startTag, endTag, defaultText) {
            var selectedText = editor.getSelectedText();
            var text = selectedText || defaultText;
            var range = editor.getSelectionRange();

            if (selectedText.length === 0) {
                // If no selection, place cursor between tags
                editor.session.replace(range, startTag + text + endTag);
                var newPos = range.start;
                newPos.column += startTag.length;
                editor.moveCursorToPosition(newPos);
                editor.clearSelection();
            } else {
                // If text is selected, wrap it with tags
                editor.session.replace(range, startTag + text + endTag);
            }
            editor.focus();
        }

        // markdown to image link
        function markdownToImageLink(editor, imageName, imageUrl) {
            var text = '![' + imageName + '](' + imageUrl + ')';
            var range = editor.getSelectionRange();
            editor.session.replace(range, text);
            editor.focus();
        }

        // markdown to emoji
        function markdownToEmoji(editor, emojiName) {
            var text = emojiName + ' ';
            var range = editor.getSelectionRange();
            editor.session.replace(range, text);
            editor.focus();
        }

        // markdown to direct mention
        function markdownToDirectMention(editor) {
            var text = '@[username] ';
            var range = editor.getSelectionRange();
            editor.session.replace(range, text);

            // Select the "username" part for easy replacement
            var newRange = range;
            newRange.start.column += 2; // position after @[
            newRange.end.column += 10; // position before ]
            editor.selection.setRange(newRange);
            editor.focus();
        }
    };
})(jQuery);
