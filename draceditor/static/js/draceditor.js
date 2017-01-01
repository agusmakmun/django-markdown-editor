/**
 * Name         : DracEditor v1.0.5
 * Created by   : Agus Makmun (Summon Agus)
 * Release date : 1-Jan-2017
 * Official     : https://dracos-linux.org
 * License      : GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007
 * Repository   : https://github.com/agusmakmun/dracos-markdown-editor
**/

(function ($) {
    if (!$) {
        $ = django.jQuery;
    }
    $.fn.draceditor = function() {

        var draceditor   = $(this);
        var dracPreview  = $('.draceditor-preview');
        var dracSplitter = $('.draceditor-splitter');

        draceditor.trigger('draceditor.init');

        // Ace editor
        var editor = ace.edit('draceditor'); // require for div#id
        var sessionEditor = editor.getSession();
        editor.setTheme('ace/theme/github');
        sessionEditor.setMode('ace/mode/markdown');
        sessionEditor.setUseWrapMode(true);
        editor.$blockScrolling = Infinity; // prevents ace from logging annoying warnings
        editor.renderer.setScrollMargin(10, 10); // set padding
        editor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true,
            enableMultiselect: false
        });

        // CSRF code
        var getCookie = function(name) {
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
        }

        // Render the content and parse as html output
        var getMarkdown = function(value) {
            var form = new FormData();
            form.append('content', value);
            form.append('csrfmiddlewaretoken', getCookie('csrftoken'));

            $.ajax({
                url: draceditor.data('markdownfy-url'),
                type: 'POST',
                data: form,
                processData: false,
                contentType: false,
                success: function(response) {
                    // Save session value to textarea (require for saving to database).
                    draceditor.val(value);
                    dracPreview.html(response);
                    $('pre').each(function(i, block){
                        hljs.highlightBlock(block);
                    });
                    draceditor.trigger('draceditor.update', [response]);
                },
                error: function(response) {
                    console.log("error", response);
                }
            })
        }

        // Ace editor for autocomplete
        var emojiWordCompleter = {
            getCompletions: function(editor, session, pos, prefix, callback) {
                var wordList = emojis; // from `atwho/emojis.min.js`
                var obj = sessionEditor.getTokenAt(pos.row, pos.column.count);
                var curTokens = obj.value.split(/\s+/);
                var lastToken = curTokens[curTokens.length-1];

                if (lastToken[0] == ':') {
                  callback(null, wordList.map(function(word) {
                      return {
                          caption: word,
                          value: word.replace(':', '') + ' ',
                          meta: 'emoji' // this should return as text only.
                      };
                  }));
                }
            }
        }
        var mentionWordCompleter = {
            getCompletions: function(editor, session, pos, prefix, callback) {
                var obj = sessionEditor.getTokenAt(pos.row, pos.column.count);
                var curTokens = obj.value.split(/\s+/);
                var lastToken = curTokens[curTokens.length-1];

                if (lastToken[0] == '@' && lastToken[1] == '[') {
                    username = lastToken.replace(/([\@\[/\]/])/g, '');
                    $.ajax({
                        url: draceditor.data('search-users-url'),
                        data: {
                            'username': username,
                            'csrfmiddlewaretoken': getCookie('csrftoken')
                        },
                        success: function(data) {
                            if (data['status'] == 200) {
                                var wordList = [];
                                for (var i = 0; i < data['data'].length; i++) {
                                    wordList.push(data['data'][i].username)
                                }
                                callback(null, wordList.map(function(word) {
                                    return {
                                        caption: word,
                                        value: word,
                                        meta: 'username' // this should return as text only.
                                    };
                                }));
                            }
                        }// end success
                    });
                }
            }
        }
        // Set autocomplete for ace editor
        editor.completers = [emojiWordCompleter, mentionWordCompleter]

        // win/linux: Ctrl+B, mac: Command+B
        var markdownToBold = function() {
            var originalRange = editor.getSelectionRange();
            if (editor.selection.isEmpty()) {
                var curpos = editor.getCursorPosition();
                editor.session.insert(curpos, ' **** ');
                editor.selection.moveTo(curpos.row, curpos.column+3);
            }else {
              var range = editor.getSelectionRange();
              var text = editor.session.getTextRange(range);
              editor.session.replace(range, '**'+text+'**');
              originalRange.end.column += 4; // this because injected from 4 `*` characters.
              editor.selection.setSelectionRange(originalRange);
            }
        };
        // win/linux: Ctrl+I, mac: Command+I
        var markdownToItalic = function() {
            var originalRange = editor.getSelectionRange();
            if (editor.selection.isEmpty()) {
                var curpos = editor.getCursorPosition();
                editor.session.insert(curpos, ' __ ');
                editor.selection.moveTo(curpos.row, curpos.column+2);
            }else {
              var range = editor.getSelectionRange();
              var text = editor.session.getTextRange(range);
              editor.session.replace(range, '_'+text+'_');
              originalRange.end.column += 2; // this because injected from 2 `_` characters.
              editor.selection.setSelectionRange(originalRange);
            }
        };
        // win/linux: Ctrl+H, mac: Command+H
        var markdownToHorizontal = function() {
            var originalRange = editor.getSelectionRange();
            if (editor.selection.isEmpty()) {
                var curpos = editor.getCursorPosition();
                editor.session.insert(curpos, '\n\n----------\n\n');
                editor.selection.moveTo(curpos.row+4, curpos.column+10);
            }
            else {
              var range = editor.getSelectionRange();
              var text = editor.session.getTextRange(range);
              editor.session.replace(range, '\n\n----------\n\n'+text);
              editor.selection.moveTo(
                  originalRange.end.row+4,
                  originalRange.end.column+10
              );
            }
        };
        // win/linux: Ctrl+Alt+1, mac: Command+Option+1
        var markdownToH1 = function() {
            var originalRange = editor.getSelectionRange();
            if (editor.selection.isEmpty()) {
                var curpos = editor.getCursorPosition();
                editor.session.insert(curpos, '\n\n# ');
                editor.selection.moveTo(curpos.row+2, curpos.column+2);
            }
            else {
              var range = editor.getSelectionRange();
              var text = editor.session.getTextRange(range);
              editor.session.replace(range, '\n\n# '+text+'\n');
              editor.selection.moveTo(
                  originalRange.end.row+2,
                  originalRange.end.column+2
              );
            }
        };
        // win/linux: Ctrl+Alt+2, mac: Command+Option+2
        var markdownToH2 = function() {
            var originalRange = editor.getSelectionRange();
            if (editor.selection.isEmpty()) {
                var curpos = editor.getCursorPosition();
                editor.session.insert(curpos, '\n\n## ');
                editor.selection.moveTo(curpos.row+2, curpos.column+3);
            }
            else {
              var range = editor.getSelectionRange();
              var text = editor.session.getTextRange(range);
              editor.session.replace(range, '\n\n## '+text+'\n');
              editor.selection.moveTo(
                  originalRange.end.row+2,
                  originalRange.end.column+3
              );
            }
        };
        // win/linux: Ctrl+Alt+3, mac: Command+Option+3
        var markdownToH3 = function() {
            var originalRange = editor.getSelectionRange();
            if (editor.selection.isEmpty()) {
                var curpos = editor.getCursorPosition();
                editor.session.insert(curpos, '\n\n### ');
                editor.selection.moveTo(curpos.row+2, curpos.column+4);
            }
            else {
              var range = editor.getSelectionRange();
              var text = editor.session.getTextRange(range);
              editor.session.replace(range, '\n\n### '+text+'\n');
              editor.selection.moveTo(
                  originalRange.end.row+2,
                  originalRange.end.column+4
              );
            }
        };
        // win/linux: Ctrl+Alt+P, mac: Command+Option+P
        var markdownToPre = function() {
            var originalRange = editor.getSelectionRange();
            if (editor.selection.isEmpty()) {
                var curpos = editor.getCursorPosition();
                editor.session.insert(curpos, '\n\n```\n\n```\n');
                editor.selection.moveTo(curpos.row+3, curpos.column);
            }
            else {
              var range = editor.getSelectionRange();
              var text = editor.session.getTextRange(range);
              editor.session.replace(range, '\n\n```\n'+text+'\n```\n');
              editor.selection.moveTo(
                  originalRange.end.row+3,
                  originalRange.end.column+3
              );
            }
        };
        // win/linux: Ctrl+Alt+C, mac: Command+Option+C
        var markdownToCode = function() {
            var originalRange = editor.getSelectionRange();
            if (editor.selection.isEmpty()) {
                var curpos = editor.getCursorPosition();
                editor.session.insert(curpos, ' `` ');
                editor.selection.moveTo(curpos.row, curpos.column+2);
            }else {
              var range = editor.getSelectionRange();
              var text = editor.session.getTextRange(range);
              editor.session.replace(range, '`'+text+'`');
              originalRange.end.column += 2; // this because injected from 2 `_` characters.
              editor.selection.setSelectionRange(originalRange);
            }
        };
        // win/linux: Ctrl+Q, mac: Command+Q
        var markdownToBlockQuote = function() {
            var originalRange = editor.getSelectionRange();
            if (editor.selection.isEmpty()) {
                var curpos = editor.getCursorPosition();
                editor.session.insert(curpos, '\n\n> \n');
                editor.selection.moveTo(curpos.row+2, curpos.column+2);
            }
            else {
              var range = editor.getSelectionRange();
              var text = editor.session.getTextRange(range);
              editor.session.replace(range, '\n\n> '+text+'\n');
              editor.selection.moveTo(
                  originalRange.end.row+2,
                  originalRange.end.column+2
              );
            }
        };
        // win/linux: Ctrl+U, mac: Command+U
        var markdownToUnorderedList = function() {
            var originalRange = editor.getSelectionRange();
            if (editor.selection.isEmpty()) {
                var curpos = editor.getCursorPosition();
                editor.session.insert(curpos, '\n\n* ');
                editor.selection.moveTo(curpos.row+2, curpos.column+2);
            }
            else {
              var range = editor.getSelectionRange();
              var text = editor.session.getTextRange(range);
              editor.session.replace(range, '\n\n* '+text);
              editor.selection.moveTo(
                  originalRange.end.row+2,
                  originalRange.end.column+2
              );
            }
        };
        // win/linux: Ctrl+Shift+O, mac: Command+Option+O
        var markdownToOrderedList = function() {
            var originalRange = editor.getSelectionRange();
            if (editor.selection.isEmpty()) {
                var curpos = editor.getCursorPosition();
                editor.session.insert(curpos, '\n\n1. ');
                editor.selection.moveTo(curpos.row+2, curpos.column+3);
            }
            else {
              var range = editor.getSelectionRange();
              var text = editor.session.getTextRange(range);
              editor.session.replace(range, '\n\n1. '+text);
              editor.selection.moveTo(
                  originalRange.end.row+2,
                  originalRange.end.column+3
              );
            }
        };
        // win/linux: Ctrl+L, mac: Command+L
        var markdownToLink = function() {
            var originalRange = editor.getSelectionRange();
            if (editor.selection.isEmpty()) {
                var curpos = editor.getCursorPosition();
                editor.session.insert(curpos, ' [](http://) ');
                editor.selection.moveTo(curpos.row, curpos.column+2);
            }else {
              var range = editor.getSelectionRange();
              var text = editor.session.getTextRange(range);
              editor.session.replace(range, '['+text+'](http://) ');
              editor.selection.moveTo(
                  originalRange.end.row,
                  originalRange.end.column+10
              );
            }
        };
        // win/linux: Ctrl+Shift+I, mac: Command+Option+I
        // or via upload: imageData={name:null, link:null}
        var markdownToImageLink = function(imageData) {
            var originalRange = editor.getSelectionRange();
            if (typeof(imageData) === 'undefined') {
                if (editor.selection.isEmpty()) {
                    var curpos = editor.getCursorPosition();
                    editor.session.insert(curpos, ' ![](http://) ');
                    editor.selection.moveTo(curpos.row, curpos.column+3);
                }else {
                    var range = editor.getSelectionRange();
                    var text = editor.session.getTextRange(range);
                    editor.session.replace(range, '!['+text+'](http://) ');
                    editor.selection.moveTo(
                        originalRange.end.row,
                        originalRange.end.column+11
                    );
                }
            }else { // this if use image upload to imgur.
              var curpos = editor.getCursorPosition();
              editor.session.insert(curpos, '!['+imageData.name+']('+imageData.link+') ');
              editor.selection.moveTo(
                  curpos.row,
                  curpos.column+imageData.name.length+2
              );
            }
        };
        // win/linux: Ctrl+M, mac: Command+M
        var markdownToMention = function() {
            var originalRange = editor.getSelectionRange();
            if (editor.selection.isEmpty()) {
                var curpos = editor.getCursorPosition();
                editor.session.insert(curpos, ' @[]');
                editor.selection.moveTo(curpos.row, curpos.column+3);
            }else {
              var range = editor.getSelectionRange();
              var text = editor.session.getTextRange(range);
              editor.session.replace(range, '@['+text+']');
              editor.selection.moveTo(
                  originalRange.end.row,
                  originalRange.end.column+3
              )
            }
        };
        // Insert Emoji to text editor: $('.insert-emoji').data('emoji-target')
        var markdownToEmoji = function(data_target) {
            var curpos = editor.getCursorPosition();
            editor.session.insert(curpos, ' '+data_target+' ');
            editor.selection.moveTo(curpos.row, curpos.column+data_target.length+2);
        };

        // Markdown Image Uploader auto insert to editor.
        // with special insert, eg: ![avatar.png](i.imgur.com/DytfpTz.png)
        var markdownToUploadImage = function() {
            var form = new FormData(draceditor.closest('form').get(0));
            form.append('csrfmiddlewaretoken', getCookie('csrftoken'));

            $.ajax({
                url: draceditor.data('upload-url'),
                type: 'POST',
                data: form,
                async: true,
                cache: false,
                contentType: false,
                enctype: 'multipart/form-data',
                processData: false,
                beforeSend: function() {
                    console.log('Uploading...');
                    $('.upload-progress').show();
                },
                success: function (response) {
                    $('.upload-progress').hide();
                    if (response.status == 200) {
                        console.log(response);
                        markdownToImageLink(imageData={
                            name: response.name,
                            link: response.link
                        })
                    }else {
                        try {
                            var error = JSON.parse(response.error);
                            alert('Vailed to upload! ' + error['data']['error'] + ', error_code: ' + error['status']);
                        }catch(error){
                            alert('Vailed to upload! ' + response.error + ', error_code :' + response.status);
                        }
                        console.log(response);
                    }
                },
                error: function(response) {
                    console.log("error", response);
                    $('.upload-progress').hide();
                }
            });
            return false;
        }

        // Trigger Keyboards
        editor.commands.addCommand({
            name: 'markdownToBold',
            bindKey: {win: 'Ctrl-B', mac: 'Command-B'},
            exec: function(editor) {
                markdownToBold()
            },
            readOnly: true
        });
        editor.commands.addCommand({
            name: 'markdownToItalic',
            bindKey: {win: 'Ctrl-I', mac: 'Command-I'},
            exec: function(editor) {
                markdownToItalic()
            },
            readOnly: true
        });
        editor.commands.addCommand({
            name: 'markdownToHorizontal',
            bindKey: {win: 'Ctrl-H', mac: 'Command-H'},
            exec: function(editor) {
                markdownToHorizontal()
            },
            readOnly: true
        });
        editor.commands.addCommand({
            name: 'markdownToH1',
            bindKey: {win: 'Ctrl-Alt-1', mac: 'Command-Option-1'},
            exec: function(editor) {
                markdownToH1()
            },
            readOnly: true
        });
        editor.commands.addCommand({
            name: 'markdownToH2',
            bindKey: {win: 'Ctrl-Alt-2', mac: 'Command-Option-3'},
            exec: function(editor) {
                markdownToH2()
            },
            readOnly: true
        });
        editor.commands.addCommand({
            name: 'markdownToH3',
            bindKey: {win: 'Ctrl-Alt-3', mac: 'Command-Option-3'},
            exec: function(editor) {
                markdownToH3()
            },
            readOnly: true
        });
        editor.commands.addCommand({
            name: 'markdownToPre',
            bindKey: {win: 'Ctrl-Alt-P', mac: 'Command-Option-P'},
            exec: function(editor) {
                markdownToPre()
            },
            readOnly: true
        });
        editor.commands.addCommand({
            name: 'markdownToCode',
            bindKey: {win: 'Ctrl-Alt-C', mac: 'Command-Option-C'},
            exec: function(editor) {
                markdownToCode()
            },
            readOnly: true
        });
        editor.commands.addCommand({
            name: 'markdownToBlockQuote',
            bindKey: {win: 'Ctrl-Q', mac: 'Command-Q'},
            exec: function(editor) {
                markdownToBlockQuote()
            },
            readOnly: true
        });
        editor.commands.addCommand({
            name: 'markdownToUnorderedList',
            bindKey: {win: 'Ctrl-U', mac: 'Command-U'},
            exec: function(editor) {
                markdownToUnorderedList()
            },
            readOnly: true
        });
        editor.commands.addCommand({
            name: 'markdownToOrderedList',
            bindKey: {win: 'Ctrl-Shift+O', mac: 'Command-Option-O'},
            exec: function(editor) {
                markdownToOrderedList()
            },
            readOnly: true
        });
        editor.commands.addCommand({
            name: 'markdownToLink',
            bindKey: {win: 'Ctrl-L', mac: 'Command-L'},
            exec: function(editor) {
                markdownToLink()
            },
            readOnly: true
        });
        editor.commands.addCommand({
            name: 'markdownToImageLink',
            bindKey: {win: 'Ctrl-Shift-I', mac: 'Command-Option-I'},
            exec: function(editor) {
                markdownToImageLink()
            },
            readOnly: true
        });
        editor.commands.addCommand({
            name: 'markdownToMention',
            bindKey: {win: 'Ctrl-M', mac: 'Command-M'},
            exec: function(editor) {
                markdownToMention()
            },
            readOnly: true
        });

        // Trigger Click
        $('.markdown-bold').click(function(){
            markdownToBold();
        });
        $('.markdown-italic').click(function(){
            markdownToItalic();
        });
        $('.markdown-horizontal').click(function(){
            markdownToHorizontal();
        });
        $('.markdown-h1').click(function(){
            markdownToH1();
        });
        $('.markdown-h2').click(function(){
            markdownToH2();
        });
        $('.markdown-h3').click(function(){
            markdownToH3();
        });
        $('.markdown-pre').click(function(){
            markdownToPre();
        });
        $('.markdown-code').click(function(){
            markdownToCode();
        });
        $('.markdown-blockquote').click(function(){
            markdownToBlockQuote();
        });
        $('.markdown-unordered-list').click(function(){
            markdownToUnorderedList();
        });
        $('.markdown-ordered-list').click(function(){
            markdownToOrderedList();
        });
        $('.markdown-link').click(function(){
            markdownToLink();
        });
        $('.markdown-image-link').click(function(){
            markdownToImageLink();
        });
        $('.markdown-direct-mention').click(function(){
            markdownToMention();
        });
        // To Upload Image
        $('.markdown-image-upload').on('change', function(evt){
            evt.preventDefault();
            markdownToUploadImage();
        });
        // Modal Popup for Help Guide & Emoji Cheat Sheet
        $('.markdown-help').click(function(){
            $('.modal-help-guide').modal('show');
        });

        // Toggle editor & preview
        var draceEditorId    = $('#draceditor');
        var btnToggleEditor  = $('.markdown-toggle-editor');
        var btnTogglePreview = $('.markdown-toggle-preview');

        var handleToggleEditorOne = function() {
            dracPreview.hide();
            draceEditorId.css('right', '0%');
            editor.resize();
            btnToggleEditor.one('click', handleToggleEditorTwo);
            btnTogglePreview.addClass('disabled');
        }
        var handleToggleEditorTwo = function(){
            draceEditorId.css('right', '50%');
            editor.resize();
            dracPreview.show();
            btnToggleEditor.one('click', handleToggleEditorOne);
            btnTogglePreview.removeClass('disabled');
        }
        // Toggle preview
        var handleTogglePreviewOne = function() {
            draceEditorId.hide();
            dracPreview.css('left', '0%');
            btnTogglePreview.one('click', handleTogglePreviewTwo);
            btnToggleEditor.addClass('disabled');
        }
        var handleTogglePreviewTwo = function(){
            dracPreview.css('left', '50%');
            draceEditorId.show();
            btnTogglePreview.one('click', handleTogglePreviewOne);
            btnToggleEditor.removeClass('disabled');
        }
        btnToggleEditor.one('click', handleToggleEditorOne);
        btnTogglePreview.one('click', handleTogglePreviewOne);

        // Show emojis cheat sheet and insert to ace editor.
        $('.markdown-emoji').click(function(){
            var modalEmoji = $('.modal-emoji');
            var emojiList = emojis; // from `plugins/js/emojis.min.js`
            var segmentEmoji = $('.emoji-content-body');
            var loaderInit  = $('.emoji-loader-init');

            // setup initial loader
            segmentEmoji.html('');
            loaderInit.show();
            modalEmoji.modal({
                onVisible: function () {
                    for (var i = 0; i < emojiList.length; i++) {
                        var linkEmoji = draceditor.data('base-emoji-url') + emojiList[i].replace(/:/g, '') + '.png';
                        segmentEmoji.append('<div class="four wide column"><p>' +
                                                '<a data-emoji-target="' + emojiList[i] +
                                                '" class="insert-emoji"><img class="marked-emoji" src="' +
                                                linkEmoji + '"> ' + emojiList[i] +
                                            '</a></p></div>');
                        $('a[data-emoji-target="'+emojiList[i]+'"]').click(function(){
                            markdownToEmoji($(this).data('emoji-target'));
                            modalEmoji.modal('hide', 100);
                        });
                    }
                    loaderInit.hide();
                    modalEmoji.modal('refresh');
                }
            }).modal('show');
        });

        var timeout;
        var markdownIfy = function(value) {
            clearTimeout(timeout);
            timeout = setTimeout(function(){
                getMarkdown(value);
            }, 500);
        };

        // Set if editor has changed.
        editor.on('change', function(evt){
            value = editor.getValue();
            markdownIfy(value);
        });

        // Set initial value if has the content before.
        if (draceditor.val() != '') {
            var value = editor.setValue(draceditor.val());
            markdownIfy(value);
        }

        // Synchronize the scroll positions between the editor and preview.
        /*
        sessionEditor.on('changeScrollTop', function(scroll) {
            // var totalLinesEditor  = editor.getSession().doc.getAllLines().length;
            // var totalLinesPreview = dracPreview[0].scrollHeight;
            // var currentScroll = parseInt(scroll) || 0;
            // var scrollFactor = currentScroll / totalLinesEditor;
            dracPreview.scrollTop(
                sessionEditor.getScrollTop()
            );
        });
        dracPreview.on('scroll', function () {
            sessionEditor.setScrollTop(
                $(this).scrollTop()
            );
        });
        */
        sessionEditor.on('changeScrollTop', function(scroll) {
            dracPreview.scrollTop(
                sessionEditor.getScrollTop()
            );
        });
};
$(function() {
    $('.draceditor').draceditor();
});
})(jQuery);

$( document ).ready(function(){
    // Semantic UI
    $('.ui.dropdown').dropdown();
    $('.button').popup();
});
