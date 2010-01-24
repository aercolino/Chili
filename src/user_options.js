    Chili = //implied global
    { 
        automatic:          true,
        automaticSelector:  "code",
        lineNumbers:        !true,
        recipeLoading:      true,
        recipeFolder:       "", // used like: recipeFolder + recipeName + '.js'
        codeLanguage: function( el ) 
        {
            var recipeName = $( el ).attr( "class" );
            return recipeName ? recipeName : '';
        },
        selectionStyle:     
        [ 
            "position:absolute; z-index:3000; overflow:scroll;",
            "width:16em;",
            "height:9em;",
            "border:1px solid gray;",
            "padding:15px;",
            "background-color:yellow;"
        ].join( ' ' ),
        /**
         * Returns the codes of any character of the given text
         * 
         * @param {String} text
         * 
         * @return String
         */
        revealChars: function ( text ) 
        {
            var result = [];
            for (var i=0, iTop=text.length; i<iTop; i++)
            {
                result.push(text[i] + ' <- ' + text.charCodeAt(i));
            }
            result = result.join('\n');
            return result;
        },
        replaceSpace:   "&#160;", // IE and FF convert &#160; to "&nbsp;", Safari and Opera do not
        replaceTab:     "&#160;&#160;&#160;&#160;",
        replaceNewLine: "&#160;<br />",
        recipes:        {} //repository
    };
