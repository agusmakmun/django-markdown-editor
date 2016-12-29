(function ($) {
    if (!$) {
        $ = django.jQuery;
    }
    $.fn.draceditor = function() {

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

    // Markdown Image Uploader auto insert to textarea.
    // with special insert, eg: ![avatar.png](i.imgur.com/DytfpTz.png)
    var uploadFile = function(selector) {
        selector.on('change', function(evt) {
          evt.preventDefault();
          var formData = new FormData($('form').get(0));
          formData.append("csrfmiddlewaretoken", getCookie('csrftoken'));

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
                  console.log("uploading...");
              },
              success: function (response) {
                  if (response.status == 200) {
                      var name = response.name;
                      var link = response.link;
                      //insertText(textarea_id, "![", "]("+link+")", name);
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
        });
    }

    // Markdown Emoji
    // require `atwho/atwho.min.js` and list `emojis` from `atwho/emojis.min.js`
    var onEmoji = function(textarea) {
      $emojis = emojis; // from `atwho/emojis.min.js`
      var emojiurl = draceditor.data('base-emoji-url');
      var emoji_config = {
          at: ":",
          data: $.map($emojis, function(value, i) {return {key: value.replace(/:/g , ''), name:value}}),
          displayTpl: "<li>${name} <img src='"+emojiurl+"${key}.png'  height='20' width='20' /></li>",
          insertTpl: ':${key}:',
          delay: 400
      }
      // Triger process if inserted: https://github.com/ichord/At.js/wiki/Events#insertedatwho
      textarea.atwho(emoji_config).on('inserted.atwho', function(event, flag, query) {
        //$('.markdownx').markdownx();
      });
    }

    // Markdown Mention
    var onMention = function() {
      draceditor.atwho({
        at: "@[",
        displayTpl: "<li>${name}</li>",
        insertTpl: "@[${key}]",
        limit: 20,
        callbacks: {
            remoteFilter: function(query, callback) {
              $.ajax({
                  url: draceditor.data('search-users-urls-path'),
                  data: {
                      'username': query,
                      'csrfmiddlewaretoken': getCookie('csrftoken')
                  },
                  success: function(data) {
                      if (data['status'] == 200) {
                        var array_data = [];
                        for (var i = 0; i < data['data'].length; i++) {
                            array_data.push(data['data'][i].username)
                        }
                        mapping = $.map(array_data, function(value, i) {return {key: value, name:value}}),
                        callback(mapping);
                      }
                  }
              });
            }//end remoteFilter
        }
      });
    };

    var onKeyUpEvent = function(e) {
      console.log(e);
      onMention();
      onEmoji();
    }

    var draceditor = $(this);
    var dracEditor = $(this).find('.draceditor');
    dracEditor.on('keydown.draceditor', onKeyUpEvent);

    dracEditor.trigger('draceditor.init');

    var selector_upload = $('.upload-image-file');
    selector_upload.click(function(){
      uploadFile(selector_upload);
    });

    // Ace editor
    var editor = ace.edit('editor');
    editor.setTheme('ace/theme/github');
    editor.getSession().setMode('ace/mode/markdown');
    editor.$blockScrolling = Infinity; //prevents ace from logging annoying warnings
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
    var langTools = ace.require('ace/ext/language_tools');

    var emojiWordCompleter = {
        getCompletions: function(editor, session, pos, prefix, callback) {
            var wordList = emojis; // from `atwho/emojis.min.js`
            var obj = editor.getSession().getTokenAt(pos.row, pos.column.count);
            var curTokens = obj.value.split(/\s+/);
            var lastToken = curTokens[curTokens.length-1];

            if (lastToken[0] == ':') {
              console.log(lastToken);
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
    editor.completers = [emojiWordCompleter]

    // update preview based on editor content
    var onRender = function(){
        marked.setOptions({
            renderer    : markedRenderer, // require from `marked-emoji.js`
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
        //onEmoji(container_area);
        //onMention(editor);
        onRender();
    });

    // Set initial value
    editor.setValue(draceditor.val());
    onRender();

    // Trigger Keyboards
    var onKeyboard = function(editor) {
        /*
        var commandChars = {
          'bold'            : ['**', '**'],
          'italic'          : ['_', '_'],
          'h1'              : ['# ', ''],
          'h2'              : ['## ', ''],
          'h3'              : ['### ', ''],
          'pre'             : ['```', '\n```'],
          'code'            : ['`', '``'],
          'blockquote'      : ['> ', '']
          'unordered-list'  : ['* ', ''],
          'ordered-list'    : ['1. ', ''],
          'link'            : ['[', '](http://)'],
          'image-link'      : ['![', '](http://)']
        }*/

        // win/linux: Ctrl+B, mac: Command+B
        var markdownToBold = function() {
            var originalRange = editor.getSelectionRange();
            if (editor.selection.isEmpty()) {
                var curpos = editor.getCursorPosition();
                editor.session.insert(curpos, ' **** ')
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
                editor.session.insert(curpos, ' __ ')
                editor.selection.moveTo(curpos.row, curpos.column+2);
            }else {
              var range = editor.getSelectionRange();
              var text = editor.session.getTextRange(range);
              editor.session.replace(range, '_'+text+'_');
              originalRange.end.column += 2; // this because injected from 2 `_` characters.
              editor.selection.setSelectionRange(originalRange);
            }
        };
        // win/linux: Ctrl+Q, mac: Command+Q
        var markdownToBlockQuote = function() {
            var originalRange = editor.getSelectionRange();
            if (editor.selection.isEmpty()) {
                var curpos = editor.getCursorPosition();
                editor.session.insert(curpos, '\n\n> ');
                editor.selection.moveTo(curpos.row+2, curpos.column+2);
            }
            else {
              var range = editor.getSelectionRange();
              var text = editor.session.getTextRange(range);
              editor.session.replace(range, '\n\n> '+text);
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
              editor.session.replace(range, '\n\n> '+text);
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
                editor.selection.moveTo(curpos.row+3, curpos.column+3);
            }
            else {
              var range = editor.getSelectionRange();
              var text = editor.session.getTextRange(range);
              editor.session.replace(range, '\n\n1. '+text);
              editor.selection.moveTo(
                  originalRange.end.row+3,
                  originalRange.end.column+3
              );
            }
        };
        // win/linux: Ctrl+L, mac: Command+L
        var markdownToLink = function() {
            var originalRange = editor.getSelectionRange();
            if (editor.selection.isEmpty()) {
                var curpos = editor.getCursorPosition();
                editor.session.insert(curpos, ' [](http://) ')
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
        var markdownToImageLink = function() {
            var originalRange = editor.getSelectionRange();
            if (editor.selection.isEmpty()) {
                var curpos = editor.getCursorPosition();
                editor.session.insert(curpos, ' ![](http://) ')
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
        };

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
    }
    onKeyboard(editor);
};

$(function() {
  $.fn.atwho.debug = true;
  $('.draceditor').draceditor();
});
})(jQuery);
