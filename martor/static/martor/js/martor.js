/**
 * Name         : Martor v1.2.0
 * Created by   : Agus Makmun (Summon Agus)
 * Release date : 18-Sep-2017
 * License      : GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007
 * Repository   : https://github.com/agusmakmun/django-markdown-editor
**/

(function ($) {
    if (!$) {
        $ = django.jQuery;
    }
    $.fn.martor = function() {

        var martor         = $(this);
        var mainMartor     = $('.main-martor');

        martor.trigger('martor.init');

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

        // Each multiple editor fields
        mainMartor.each(function(i, obj) {
            var field_name   = $(obj).data('field-name');
            var textareaId   = $('#id_'+field_name);
            var editorId     = 'martor-'+field_name;
            var editor       = ace.edit(editorId);
            var editorConfig = JSON.parse(textareaId.data('enable-configs').replace(/'/g, '"'));

            editor.setTheme('ace/theme/github');
            editor.getSession().setMode('ace/mode/markdown');
            editor.getSession().setUseWrapMode(true);
            editor.$blockScrolling = Infinity; // prevents ace from logging annoying warnings
            editor.renderer.setScrollMargin(10, 10); // set padding
            editor.setAutoScrollEditorIntoView(true);
            editor.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true,
                enableLiveAutocompletion: true,
                enableMultiselect: false
            });

            var emojiWordCompleter = {
                getCompletions: function(editor, session, pos, prefix, callback) {
                    var wordList = emojis; // from `atwho/emojis.min.js`
                    var obj = editor.getSession().getTokenAt(pos.row, pos.column.count);
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
                    var obj = editor.getSession().getTokenAt(pos.row, pos.column.count);
                    var curTokens = obj.value.split(/\s+/);
                    var lastToken = curTokens[curTokens.length-1];

                    if (lastToken[0] == '@' && lastToken[1] == '[') {
                        username = lastToken.replace(/([\@\[/\]/])/g, '');
                        $.ajax({
                            url: textareaId.data('search-users-url'),
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
            if (editorConfig.mention === 'true') {
                editor.completers = [emojiWordCompleter, mentionWordCompleter]
            }else {
                editor.completers = [emojiWordCompleter]
            }

            // set css `display:none` fot this textarea.
            textareaId.attr({'style': 'display:none'});

            // assign all button single toolbar
            $(obj).find('.martor-toolbar').find('.markdown-selector').attr({'data-field-name': field_name});
            $(obj).find('.upload-progress').attr({'data-field-name': field_name});
            $(obj).find('.modal-help-guide').attr({'data-field-name': field_name});
            $(obj).find('.modal-emoji').attr({'data-field-name': field_name});

            // Set if editor has changed.
            editor.on('change', function(evt){
                var value = editor.getValue();
                textareaId.val(value);
            });

            // resize the editor using `resizable.min.js`
            $('#'+editorId).resizable({
		            direction: 'bottom',
                stop: function() {
                    editor.resize();
                }
            });

            // update the preview if this menu is clicked
            var currentTab = $('.tab.segment[data-tab=preview-tab-'+field_name+']');
            var previewTabButton = $('.item[data-tab=preview-tab-'+field_name+']');
            previewTabButton.click(function(){
                // hide the `.martor-toolbar` for this current editor if under preview.
                $(this).closest('.tab-martor-menu').find('.martor-toolbar').hide();

                var value = editor.getValue();
                var form = new FormData();
                form.append('content', value);
                form.append('csrfmiddlewaretoken', getCookie('csrftoken'));

                $.ajax({
                    url: textareaId.data('markdownfy-url'),
                    type: 'POST',
                    data: form,
                    processData: false,
                    contentType: false,
                    success: function(response) {
                        if(response){
                          currentTab.html(response);
                          $('pre').each(function(i, block){
                              hljs.highlightBlock(block);
                          });
                        }else {currentTab.html('<p>Nothing to preview</p>');}
                    },
                    error: function(response) {
                        console.log("error", response);
                    }
                });
            });// end click `previewTabButton`

            var editorTabButton = $('.item[data-tab=editor-tab-'+field_name+']');
            editorTabButton.click(function(){
                // show the `.martor-toolbar` for this current editor if under preview.
                $(this).closest('.tab-martor-menu').find('.martor-toolbar').show();
            });


            // win/linux: Ctrl+B, mac: Command+B
            var markdownToBold = function(editor) {
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
            var markdownToItalic = function(editor) {
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
            // win/linux: Ctrl+Shift+U
            var markdownToUnderscores = function(editor) {
                var originalRange = editor.getSelectionRange();
                if (editor.selection.isEmpty()) {
                    var curpos = editor.getCursorPosition();
                    editor.session.insert(curpos, ' ++++ ');
                    editor.selection.moveTo(curpos.row, curpos.column+3);
                }else {
                  var range = editor.getSelectionRange();
                  var text = editor.session.getTextRange(range);
                  editor.session.replace(range, '++'+text+'++');
                  originalRange.end.column += 4; // this because injected from 4 `*` characters.
                  editor.selection.setSelectionRange(originalRange);
                }
            };
            // win/linux: Ctrl+Shift+S
            var markdownToStrikethrough = function(editor) {
                var originalRange = editor.getSelectionRange();
                if (editor.selection.isEmpty()) {
                    var curpos = editor.getCursorPosition();
                    editor.session.insert(curpos, ' ~~~~ ');
                    editor.selection.moveTo(curpos.row, curpos.column+3);
                }else {
                  var range = editor.getSelectionRange();
                  var text = editor.session.getTextRange(range);
                  editor.session.replace(range, '~~'+text+'~~');
                  originalRange.end.column += 4; // this because injected from 4 `*` characters.
                  editor.selection.setSelectionRange(originalRange);
                }
            };
            // win/linux: Ctrl+H, mac: Command+H
            var markdownToHorizontal = function(editor) {
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
            var markdownToH1 = function(editor) {
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
            var markdownToH2 = function(editor) {
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
            var markdownToH3 = function(editor) {
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
            var markdownToPre = function(editor) {
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
            var markdownToCode = function(editor) {
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
            var markdownToBlockQuote = function(editor) {
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
            var markdownToUnorderedList = function(editor) {
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
            var markdownToOrderedList = function(editor) {
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
            var markdownToLink = function(editor) {
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
            var markdownToImageLink = function(editor, imageData) {
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
            var markdownToMention = function(editor) {
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
            var markdownToEmoji = function(editor, data_target) {
                var curpos = editor.getCursorPosition();
                editor.session.insert(curpos, ' '+data_target+' ');
                editor.selection.moveTo(curpos.row, curpos.column+data_target.length+2);
            };
            // Markdown Image Uploader auto insert to editor.
            // with special insert, eg: ![avatar.png](i.imgur.com/DytfpTz.png)
            var markdownToUploadImage = function(editor) {
                var firstForm = $('#'+editorId).closest('form').get(0);
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
                    beforeSend: function() {
                        console.log('Uploading...');
                        $('.upload-progress[data-field-name='+field_name+']').show();
                    },
                    success: function (response) {
                        $('.upload-progress[data-field-name='+field_name+']').hide();
                        if (response.status == 200) {
                            console.log(response);
                            markdownToImageLink(
                              editor=editor,
                              imageData={name: response.name, link: response.link}
                            );
                        }else {console.log(response)}
                    },
                    error: function(response) {
                        console.log("error", response);
                        $('.upload-progress[data-field-name='+field_name+']').hide();
                    }
                });
                return false;
            };

            // Trigger Keyboards
            editor.commands.addCommand({
                name: 'markdownToBold',
                bindKey: {win: 'Ctrl-B', mac: 'Command-B'},
                exec: function(editor) {
                    markdownToBold(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToItalic',
                bindKey: {win: 'Ctrl-I', mac: 'Command-I'},
                exec: function(editor) {
                    markdownToItalic(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToUnderscores',
                bindKey: {win: 'Ctrl-Shift-U', mac: 'Command-Option-U'},
                exec: function(editor) {
                    markdownToUnderscores(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToStrikethrough',
                bindKey: {win: 'Ctrl-Shift-S', mac: 'Command-Option-S'},
                exec: function(editor) {
                    markdownToStrikethrough(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToHorizontal',
                bindKey: {win: 'Ctrl-H', mac: 'Command-H'},
                exec: function(editor) {
                    markdownToHorizontal(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToH1',
                bindKey: {win: 'Ctrl-Alt-1', mac: 'Command-Option-1'},
                exec: function(editor) {
                    markdownToH1(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToH2',
                bindKey: {win: 'Ctrl-Alt-2', mac: 'Command-Option-3'},
                exec: function(editor) {
                    markdownToH2(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToH3',
                bindKey: {win: 'Ctrl-Alt-3', mac: 'Command-Option-3'},
                exec: function(editor) {
                    markdownToH3(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToPre',
                bindKey: {win: 'Ctrl-Alt-P', mac: 'Command-Option-P'},
                exec: function(editor) {
                    markdownToPre(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToCode',
                bindKey: {win: 'Ctrl-Alt-C', mac: 'Command-Option-C'},
                exec: function(editor) {
                    markdownToCode(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToBlockQuote',
                bindKey: {win: 'Ctrl-Q', mac: 'Command-Q'},
                exec: function(editor) {
                    markdownToBlockQuote(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToUnorderedList',
                bindKey: {win: 'Ctrl-U', mac: 'Command-U'},
                exec: function(editor) {
                    markdownToUnorderedList(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToOrderedList',
                bindKey: {win: 'Ctrl-Shift+O', mac: 'Command-Option-O'},
                exec: function(editor) {
                    markdownToOrderedList(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToLink',
                bindKey: {win: 'Ctrl-L', mac: 'Command-L'},
                exec: function(editor) {
                    markdownToLink(editor);
                },
                readOnly: true
            });
            editor.commands.addCommand({
                name: 'markdownToImageLink',
                bindKey: {win: 'Ctrl-Shift-I', mac: 'Command-Option-I'},
                exec: function(editor) {
                    markdownToImageLink(editor);
                },
                readOnly: true
            });
            if (editorConfig.mention === 'true') {
                editor.commands.addCommand({
                    name: 'markdownToMention',
                    bindKey: {win: 'Ctrl-M', mac: 'Command-M'},
                    exec: function(editor) {
                        markdownToMention(editor);
                    },
                    readOnly: true
                });
            }

            // Trigger Click
            $('.markdown-bold[data-field-name='+field_name+']').click(function(){
                markdownToBold(editor);
            });
            $('.markdown-italic[data-field-name='+field_name+']').click(function(){
                markdownToItalic(editor);
            });
            $('.markdown-horizontal[data-field-name='+field_name+']').click(function(){
                markdownToHorizontal(editor);
            });
            $('.markdown-h1[data-field-name='+field_name+']').click(function(){
                markdownToH1(editor);
            });
            $('.markdown-h2[data-field-name='+field_name+']').click(function(){
                markdownToH2(editor);
            });
            $('.markdown-h3[data-field-name='+field_name+']').click(function(){
                markdownToH3(editor);
            });
            $('.markdown-pre[data-field-name='+field_name+']').click(function(){
                markdownToPre(editor);
            });
            $('.markdown-code[data-field-name='+field_name+']').click(function(){
                markdownToCode(editor);
            });
            $('.markdown-blockquote[data-field-name='+field_name+']').click(function(){
                markdownToBlockQuote(editor);
            });
            $('.markdown-unordered-list[data-field-name='+field_name+']').click(function(){
                markdownToUnorderedList(editor);
            });
            $('.markdown-ordered-list[data-field-name='+field_name+']').click(function(){
                markdownToOrderedList(editor);
            });
            $('.markdown-link[data-field-name='+field_name+']').click(function(){
                markdownToLink(editor);
            });
            $('.markdown-image-link[data-field-name='+field_name+']').click(function(){
                markdownToImageLink(editor);
            });

            // Custom decission for toolbar buttons.
            var btnMention = $('.markdown-direct-mention[data-field-name='+field_name+']'); // To Direct Mention
            var btnUpload = $('.markdown-image-upload[data-field-name='+field_name+']'); // To Upload Image
            if (editorConfig.mention === 'true' && editorConfig.imgur === 'true') {
                btnMention.click(function(){
                    markdownToMention(editor);
                });
                btnUpload.on('change', function(evt){
                    evt.preventDefault();
                    markdownToUploadImage(editor);
                });
            }else if (editorConfig.mention === 'true' && editorConfig.imgur === 'false') {
                btnMention.click(function(){
                    markdownToMention(editor);
                });
                btnUpload.remove();
            }else if (editorConfig.mention === 'false' && editorConfig.imgur === 'true') {
                btnMention.remove();
                btnUpload.on('change', function(evt){
                    evt.preventDefault();
                    markdownToUploadImage(editor);
                });
            }
            else {
                btnMention.remove();
                btnUpload.remove();
                // Disable help of `mention`
                $('.markdown-reference tbody tr')[1].remove();
            }

            // Modal Popup for Help Guide & Emoji Cheat Sheet
            $('.markdown-help[data-field-name='+field_name+']').click(function(){
                $('.modal-help-guide[data-field-name='+field_name+']').modal('show');
            });

            // Toggle editor, preview, maximize
            var mainMartor        = $(obj);
            var martorField       = $('.martor-field-'+field_name);
            var btnToggleMaximize = $('.markdown-toggle-maximize[data-field-name='+field_name+']');

            // Toggle maximize and minimize
            var handleToggleMinimize = function() {
                $(document.body).removeClass('overflow');
                $(this).attr({'title': 'Full Screen'});
                $(this).find('.minimize.icon').removeClass('minimize').addClass('maximize');
                $('.main-martor-fullscreen').find('.martor-preview').removeAttr('style');
                mainMartor.removeClass('main-martor-fullscreen');
                martorField.removeAttr('style');
                editor.resize();
            }
            var handleToggleMaximize = function(selector) {
                selector.attr({'title': 'Minimize'});
                selector.find('.maximize.icon').removeClass('maximize').addClass('minimize');
                mainMartor.addClass('main-martor-fullscreen');

                var clientHeight = document.body.clientHeight-90;
                martorField.attr({'style':'height:'+clientHeight+'px'});

                var preview = $('.main-martor-fullscreen').find('.martor-preview');
                preview.attr({'style': 'overflow-y: auto;height:'+clientHeight+'px'});

                editor.resize();
                selector.one('click', handleToggleMinimize);
                $(document.body).addClass('overflow');
            }
            btnToggleMaximize.on('click', function(){
                handleToggleMaximize($(this));
            });

            // markdown insert emoji from the modal
            $('.markdown-emoji[data-field-name='+field_name+']').click(function(){
                var modalEmoji = $('.modal-emoji[data-field-name='+field_name+']');
                var emojiList = emojis; // from `plugins/js/emojis.min.js`
                var segmentEmoji = modalEmoji.find('.emoji-content-body');
                var loaderInit  = modalEmoji.find('.emoji-loader-init');

                // setup initial loader
                segmentEmoji.html('');
                loaderInit.show();
                modalEmoji.modal({
                    onVisible: function () {
                        for (var i = 0; i < emojiList.length; i++) {
                            var linkEmoji = textareaId.data('base-emoji-url') + emojiList[i].replace(/:/g, '') + '.png';
                            segmentEmoji.append(''
                                +'<div class="four wide column">'
                                + '<p><a data-emoji-target="'+emojiList[i]+'" class="insert-emoji">'
                                + '<img class="marked-emoji" src="'+linkEmoji+'"> '+emojiList[i]
                                + '</a></p>'
                                +'</div>');
                            $('a[data-emoji-target="'+emojiList[i]+'"]').click(function(){
                                markdownToEmoji(editor, $(this).data('emoji-target'));
                                modalEmoji.modal('hide', 100);
                            });
                        }
                        loaderInit.hide();
                        modalEmoji.modal('refresh');
                    }
                }).modal('show');
            });

            // Set initial value if has the content before.
            if (textareaId.val() != '') {
                editor.setValue(textareaId.val());
            }
        });// end each `mainMartor`
};
$(function() {
    $('.martor').martor();
});
})(jQuery);

$( document ).ready(function(){
    // Semantic UI
    $('.ui.dropdown').dropdown();
    $('.ui.tab-martor-menu .item').tab();
});
