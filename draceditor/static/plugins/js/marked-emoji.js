// Source: https://github.com/pandao/editor.md/blob/master/tests/marked-emoji-test.html

var markedRenderer     = new marked.Renderer();
var markdownToC        = markdownToC || [];
    var emojiReg = /:([\-\w]+):/g;
    var faIconReg = /:fa-([\w]+):/g;
    var editormdLogoReg = /:(editormd-logo\s?-?(\w+)?):/g;

markedRenderer.emoji = function(text) {
    var matchs = text.match(emojiReg);
    if (matchs){
        for (var i = 0, len = matchs.length; i < len; i++){
            text = text.replace(new RegExp(matchs[i]), function($1, $2){
                var faMatchs = $1.match(faIconReg);
                var name = $1.replace(/:/g, "");
                if (faMatchs){
                    for (var fa = 0, len1 = faMatchs.length; fa < len1; fa++){
                        return "<i class=\"fa "+faMatchs[fa].replace(/:/g, "")+"\"></i>";
                    }
                }
                else {
                    var emdlogoMathcs = $1.match(editormdLogoReg);
                    if (emdlogoMathcs){
                        for (var x = 0, len2 = emdlogoMathcs.length; x < len2; x++){
                            return "<i class=\""+emdlogoMathcs[x].replace(/:/g, "")+"\"></i>";
                        }
                    }
                    else {
                        return "<img class='marked-emoji' src=\"https://assets-cdn.github.com/images/icons/emoji/"+name+".png\" />";
                    }
                }
            });
        }
    }
    return text;
};

markedRenderer.blockquote = function (quote){
    return "<blockquote>\n"+quote+"</blockquote>\n";
};
markedRenderer.tablecell = function (content,flags){
    var type=flags.header?"th":"td";
    var tag=flags.align?"<"+type+' style="text-align:'+flags.align+'">':"<"+type+">";
    return tag+this.emoji(content)+"</"+type+">\n";
}
markedRenderer.heading = function (text,level,raw){
    return"<h"+level+' id="'+this.options.headerPrefix+raw.toLowerCase().replace(/[^\w]+/g,"-")+'">'+this.emoji(text)+"</h"+level+">\n"
};
markedRenderer.listitem = function (text){
    return "<li>" + this.emoji(text) + "</li>\n";
};
markedRenderer.paragraph = function(text) {
    return "<p>" + this.emoji(text) + "</p>\n";
};
