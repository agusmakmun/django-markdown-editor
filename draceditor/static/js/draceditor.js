(function ($) {
    if (!$) {
        $ = django.jQuery;
    }
    $.fn.draceditor = function() {

    var draceditor = $(this);
    var dracEditor = $(this).find('.draceditor');
    dracEditor.trigger('draceditor.init');

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

    // Ace editor
    var editor = ace.edit('editor');
    editor.setTheme('ace/theme/github');
    editor.getSession().setMode('ace/mode/markdown');
    editor.$blockScrolling = Infinity; // prevents ace from logging annoying warnings
    editor.renderer.setScrollMargin(10, 10); // set padding

    // Saving for the session.
    /*
    editor.getSession().on('change', function () {
        draceditor.val(editor.getSession().getValue());
    });*/

    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        enableMultiselect: false
    });

    // Ace autocomplete
    //var langTools = ace.require('ace/ext/language_tools');
    var emojiWordCompleter = {
        getCompletions: function(editor, session, pos, prefix, callback) {
            var wordList = emojis; // from `atwho/emojis.min.js`
            var obj = editor.getSession().getTokenAt(pos.row, pos.column.count);
            var curTokens = obj.value.split(/\s+/);
            var lastToken = curTokens[curTokens.length-1];

            if (lastToken[0] == ':') {
              //console.log(lastToken);
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
                //console.log(username);
                $.ajax({
                    url: draceditor.data('search-users-urls-path'),
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
                    }
                });
            }
        }
    }
    editor.completers = [emojiWordCompleter, mentionWordCompleter]

    // Source: https://github.com/pandao/editor.md/blob/master/tests/marked-emoji-test.html
    var markedRenderer = new marked.Renderer();
    var emojiRegex     = /:([\-\w]+):/g;
    var mentionRegex   = /\@\[([\-\S]+)\]/g;

    markedRenderer.emoji = function(text) {
        var matchEmojis = text.match(emojiRegex);
        var matchMentions = text.match(mentionRegex);

        if (matchEmojis){
            for (var i = 0, len = matchEmojis.length; i < len; i++){
                text = text.replace(new RegExp(matchEmojis[i]), function($1, $2){
                    var name = $1.replace(/:/g, '');
                    return "<img class='marked-emoji' src='" +
                            draceditor.data('base-emoji-url') + name + ".png' />";
                });
            }
        }/*
        if (matchMentions){
            for (var i = 0, len = matchMentions.length; i < len; i++){
                text = text.replace(new RegExp(matchMentions[i]), function($1, $2){
                    var name = $1.replace(mentionRegex, ''); // reg: /([\@\[/\]/])/g
                    console.log(name);
                    return "<a class='marked-mention' href='" +
                            draceditor.data('search-users-urls-path') +
                            name + "'>" + name + "</a>";
                });
            }
        }*/
        return text;
    };
    /*
    markedRenderer.mention = function(text) {
        var matchs = text.match(mentionRegex);
        if (matchs){
            for (var i = 0, len = matchs.length; i < len; i++){
                text = text.replace(new RegExp(matchs[i]), function($1, $2){
                    var name = $1.replace(mentionRegex, ''); // reg: /([\@\[/\]/])/g
                    return "<a class='marked-mention' href='" +
                            draceditor.data('search-users-urls-path') +
                            name + "'>" + name + "</a>";
                });
            }
        }
        return text;
    };*/

    markedRenderer.blockquote = function (quote){
        return "<blockquote>\n" + quote + "</blockquote>\n";
    };
    markedRenderer.tablecell = function (content, flags){
        var type = flags.header?"th":"td";
        var tag  = flags.align?"<"+type+' style="text-align:'+
                   flags.align+'">':"<"+type+">";
        return tag+this.emoji(content)+"</"+type+">\n";
    }
    markedRenderer.heading = function (text, level, raw){
        return "<h"+level+' id="'+
            this.options.headerPrefix +
            raw.toLowerCase().replace(/[^\w]+/g,"-")+'">' +
            this.emoji(text) +
            "</h"+level+">\n"
    };
    markedRenderer.listitem = function (text){
        return "<li>" +
            this.emoji(text) +
            "</li>\n";
    };
    markedRenderer.paragraph = function(text) {
        return "<p>" + this.emoji(text) + "</p>\n";
    };

    // update preview based on editor content
    var onRender = function(){
        // Release save session value to textarea (require for saving to database).
        draceditor.val(editor.getSession().getValue());

        // Setup with marked js.
        marked.setOptions({
            renderer    : markedRenderer,
            gfm         : true,
            tables      : true,
            breaks      : true,
            pedantic    : false,
            smartLists  : true,
            smartypants : true
        });
        $('#preview').html(
          marked(editor.getValue())
        );
        $('pre').each(function(i, block){
        	hljs.highlightBlock(block);
        });
    }

    editor.on('change', function(e){
        onRender();
    });

    // Set initial value
    editor.setValue(draceditor.val());
    onRender();

    // Trigger Keyboards & Buttons
    var onTriggerEvent = function(editor) {
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
        // or via button click.
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
        // or via button click.
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
        // or via button click.
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
        // or via button click.
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
        // or via button click.
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
        var markdownToUploadFile = function() {
            var formData = new FormData($('form').get(0));
            formData.append('csrfmiddlewaretoken', getCookie('csrftoken'));
            $.ajax({
                url: draceditor.data('upload-urls-path'),
                type: 'POST',
                data: formData,
                async: true,
                cache: false,
                contentType: false,
                enctype: 'multipart/form-data',
                processData: false,
                beforeSend: function() {
                    console.log('Uploading...');
                },
                success: function (response) {
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
        $('.markdown-image-upload').on('change', function(evt){
            evt.preventDefault();
            markdownToUploadFile();
        });

        // Modal Popup for Help Guide & Emoji Cheat Sheet
        $('.markdown-help').click(function(){
            $('.modal-help-guide').modal('show');
        });

        $('.markdown-emoji').click(function(){
            var modalEmoji = $('.modal-emoji');
            var emojiList = emojis; // from `atwho/emojis.min.js`
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
    }

    // Set trigger for editor
    onTriggerEvent(editor);
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
