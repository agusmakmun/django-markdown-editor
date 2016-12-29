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
        enableLiveAutocompletion: true
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

    //var container_area = $(editor.container);
    //container_area.attr({'contenteditable': 'true'});

    editor.on('change', function(e){
        //onEmoji(container_area);
        //onMention(editor);
        onRender();
    });

    // set initial value
    editor.setValue(draceditor.val());
    onRender();
};

$(function() {
  $.fn.atwho.debug = true;
  $('.draceditor').draceditor();
});
})(jQuery);
