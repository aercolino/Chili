    
    $.extend({
    	chili: {
    		options: {  
                suppressInitialEmptyLine: true,
                tabSpaces:          4,
    	        automatic:          true,
    	        automaticSelector:  "code",
    	        lineNumbers:        !true,
    	        recipeLoading:      true,
    	        recipeFolder:       "" // used like: recipeFolder + recipeName + '.js'
        	},
        	codeLanguage: function( el ) {
        	    var classes = $(el).attr('class');
                var matches = classes.match(/\bchili-lang-(\w+)/);
                var result = matches ? matches[1] : '';
                return result;
            },
            codeLineNumbers: function( el ) {
                var classes = $(el).attr('class');
                var matches = classes.match(/\bchili-ln-(\d+)-([\w][\w\-]*)|\bchili-ln-(\d+)/);
                var result = ! matches 
                    ? null
                    : matches[3] 
                        ? [ matches[0], matches[3], '' ] 
                        : [ matches[0], matches[1], matches[2] ];
                return result;
            },
            selectionStyle: [ 
                "position:absolute; z-index:3000; overflow:scroll;",
                "width:16em;",
                "height:9em;",
                "border:1px solid gray;",
                "padding:15px;",
                "background-color:yellow;"
            ].join(' '),
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
            queue: {},
            recipes: {} //repository
    	}
    });
