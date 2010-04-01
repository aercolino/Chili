
    $.extend($.chili, {
        version: "next", // development started on 2010-01-06
        
        /**
         * Returns the language piece of data for the given dom_element
         * 
         * @param {Element} dom_element
         * 
         * @return String
         */
        codeLanguage: function( dom_element ) {
            var classes = $(dom_element).attr('class');
            var matches = classes.match(/\bchili-lang-(\w+)/);
            var result = matches ? matches[1] : '';
            return result;
        },
        
        /**
         * Returns the line numbers data for the given dom_element
         * 
         * @param {Element} dom_element
         * 
         * @return Array
         */
        codeLineNumbers: function( dom_element ) {
            var classes = $(dom_element).attr('class');
            var matches = classes.match(/\bchili-ln-(\d+)-([\w][\w\-]*)|\bchili-ln-(\d+)/);
            var result = ! matches 
                ? null
                : matches[3] 
                    ? [ matches[0], matches[3], '' ] 
                    : [ matches[0], matches[1], matches[2] ];
            return result;
        },
        
        /**
         * Returns the codes of any character of the given text
         * (Used for developing Chili)
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
        
        /**
         * Loads the given CSS code as a new style element of head
         * 
         * @param {string} sourceCode
         */
        loadStylesheetInline: function ( sourceCode ) 
        { 
            if ( document.createElement ) 
            { 
                var style_element = document.createElement( "style" ); 
                style_element.type = "text/css"; 
                if ( style_element.styleSheet ) 
                {
                    style_element.styleSheet.cssText = sourceCode; // IE
                }  
                else 
                { 
                    var t = document.createTextNode( sourceCode ); 
                    style_element.appendChild( t ); 
                } 
                var head = document.getElementsByTagName( "head" )[0];
                head.appendChild( style_element ); 
            } 
        },
        
        queue: {},
        
        recipes: {},
        
        filters: {
            off: function() {
                return this.text;
            }
        }
    });
    