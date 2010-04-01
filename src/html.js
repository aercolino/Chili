        
        /**
         * Returns the given sting padded to itself the given times
         * 
         * @param {String} string
         * @param {Number} times
         */
        function repeat( string, times )
        {
            var result = '';
            for (var i = 0; i < times; i++)
            {
                result += string;
            }
            return result;
        }
        
        /**
         * Returns the given text, with all &, <, and > replaced by their HTML
         * entities
         * 
         * @param {String} text
         * 
         * @return String
         */
        function escapeHtmlSpecialChars( text ) 
        {
            var result = text
                .replace( /&/g, "&amp;" )
                .replace( /</g, "&lt;" )
                .replace( />/g, "&gt;" )
            ;
            return result;
        }
        
        /**
         * Returns the given text, with all &, <, and > replaced to their HTML
         * entities
         * 
         * @param {String} text
         * 
         * @return String
         */
        function unescapeHtmlSpecialChars( text ) 
        {
            var result = text
                .replace( /&amp;/g, "&" )
                .replace( /&lt;/g,  "<" )
                .replace( /&gt;/g,  ">" )
            ;
            return result;
        }
        
        /**
         * 
         */
        function scan( html, callback, args )
        {
            args = args || [];
            var expr = /([\w\W]*?)(?:(<[a-z]+[^>]*\/>)|(<[a-z]+[^>]*>)|(<\/[a-z]+[^>]*>))|([\w\W]+)/ig;
            var func = function(all, prolog, tag_empty, tag_open, tag_close, epilog, offset) 
            {
                var realOffset = offset;
                var token = null;
                if (epilog)
                {
                    token = tokenMake('text',  epilog, realOffset);
                    callback.apply(token, args);
                }
                else
                {
                    token = tokenMake('text',  prolog, realOffset);
                    callback.apply(token, args);
                    
                    var type  = '';
                    var value = '';
                    if (tag_empty)
                    {
                        type  = 'empty';
                        value = tag_empty;
                    }
                    else if(tag_open)
                    {
                        type  = 'open';
                        value = tag_open;
                    }
                    else if(tag_close)
                    {
                        type  = 'close';
                        value = tag_close;
                    }
                    realOffset += prolog.length;
                    token = tokenMake(type, value, realOffset);
                    callback.apply(token, args);
                }
            };
            html.replace(expr, func);
        }
        
        /**
         * Returns the given text, with all spaces replaced by the writingSpace 
         * string
         * 
         * @param {String} text
         * 
         * @return String
         */
        function escapeSpaces( text ) 
        {
            var writingSpace = '&#160;';
            var result = [];
            scan(text, function () 
            {
                var value = this.value;
                if (this.type == 'text')
                {
                    value = value.replace(/ /g, writingSpace);
                }
                result.push(value);
            });
            result = result.join('');
            return result;
        }
        
        /**
         * Returns the given text, with all tabs replaced by the writingTab 
         * string
         * 
         * @param {String} text
         * 
         * @return String
         */
        function escapeTabs( text ) 
        {
            var writingTab = repeat( '&#160;', $.chili.whiteSpace.tabWidth );
            var result = [];
            scan(text, function () 
            {
                var value = this.value;
                if (this.type == 'text')
                {
                    value = value.replace(/\t/g, writingTab);
                }
                result.push(value);
            });
            result = result.join('');
            return result;
        }
        
        /**
         * Returns the given text after making new lines uniform across 
         * all browsers
         *
         * @param {String} text
         * 
         * @return String
         */
        function fixWhiteSpaceAfterReading( text )
        {
            text = text.replace(/\r\n?/g, '\n');
            if ( $.chili.whiteSpace.no1stLine ) 
            {
                text = text.replace(/^\n/, '');
            }
            return text;
        }
        
        /**
         * Returns the given text after making new lines uniform across 
         * all browsers
         *
         * @param {String} html
         * 
         * @return String
         */
        function fixWhiteSpaceBeforeWriting( html )
        {
            //TODO hacer todo en una sola pasada
            
            var result = html;
            result = escapeTabs(result);
            result = escapeSpaces(result);
            result = makeTagsSpanOneLine(result);
            result = makeUnorderedList(result);
            return result;
        }
        
        