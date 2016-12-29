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
    var onEmoji = function() {
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
      draceditor.atwho(emoji_config).on('inserted.atwho', function(event, flag, query) {
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

    /**
     * The state of CodeMirror at the given position.
     * https://github.com/lepture/editor
     */
    var getState = function(cm, pos) {
      pos = pos || cm.getCursor('start');
      var stat = cm.getTokenAt(pos);
      if (!stat.type) return {};

      var types = stat.type.split(' ');

      var ret = {}, data, text;
      for (var i = 0; i < types.length; i++) {
        data = types[i];
        if (data === 'strong') {
          ret.bold = true;
        } else if (data === 'variable-2') {
          text = cm.getLine(pos.line);
          if (/^\s*\d+\.\s/.test(text)) {
            ret['ordered-list'] = true;
          } else {
            ret['unordered-list'] = true;
          }
        } else if (data === 'atom') {
          ret.quote = true;
        } else if (data === 'em') {
          ret.italic = true;
        }
      }
      return ret;
    }

    var replaceSelection = function(cm, active, start, end) {
      var text;
      var startPoint = cm.getCursor('start');
      var endPoint = cm.getCursor('end');
      if (active) {
        text = cm.getLine(startPoint.line);
        start = text.slice(0, startPoint.ch);
        end = text.slice(startPoint.ch);
        cm.setLine(startPoint.line, start + end);
      } else {
        text = cm.getSelection();
        cm.replaceSelection(start + text + end);

        startPoint.ch += start.length;
        endPoint.ch += start.length;
      }
      cm.setSelection(startPoint, endPoint);
      cm.focus();
    }

    var onKeyUpEvent = function(e) {
      console.log(e);
      onMention();
      onEmoji();
    }

    var timeout;
    var update = function(e) {
        console.log(e);
        onMention();
        console.log(e.getValue());
        //clearTimeout(timeout);
        //timeout = setTimeout(getMarkdown, 1000);
    };

    var editor;
    setTimeout(function(){
      //$('.CodeMirror').attr({'contentEditable': 'true'});
      editor = $('.CodeMirror')[0].CodeMirror;
      editor.on('change', update);
      editor.on('keyup', function(cm, e) {
        console.log(cm, e);
        onMention();
      });
    }, 500);

    var draceditor = $(this);
    var dracEditor = $(this).find('.draceditor');
    dracEditor.on('keydown.draceditor', onKeyUpEvent);

    dracEditor.trigger('draceditor.init');

    var selector_upload = $('.upload-image-file');
    selector_upload.click(function(){
      uploadFile(selector_upload);
    });

    onMention();
    onEmoji();
};

$(function() {
  $.fn.atwho.debug = true;
  $('.draceditor').draceditor();
});
})(jQuery);

// Development mode:
// * http://stackoverflow.com/a/27417339/6396981
// * http://cgit.drupalcode.org/uikitapi/tree/uikit/js/components/htmleditor.js?id=6b5fc5f8d767b7e2b70c44e7e01b949b89870d8f
/*
$(document).ready(function(){
  var textArea = document.getElementById('id_description');
  var editor = CodeMirror.fromTextArea(textArea, {
    onKeyEvent: function(e , s){
        if (s.type == "keyup") {
            console.log("test"); // this dosn't show anything
        }
    }
  });
  console.log(editor); // this work well.
  editor.on("keyup", function(editor, event) {
    console.log(editor); // this dosn't show anything
  });
});
*/
