    
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
     * Scans the given subject and calls the given callback, passing along 
     * the given args, for each piece of text or html tag it finds
     * 
     * @param {String} subject
     * @param {Function} callback
     * @param {Array} args
     */
    function scan( subject, callback, args )
    {
        args = args || [];
        var expr = /([\w\W]*?)(?:(<\w+[^>]*\/>)|(<\w+[^>]*>)|(<\/\w+[^>]*>))|([\w\W]+)/ig;
        var func = function(all, prolog, tag_empty, tag_open, tag_close, epilog) 
        {
            var realOffset = matches.index;
            var token;
            if (epilog)
            {
                token = tokenMake('text',  epilog, realOffset);
                callback.apply(token, args);
            }
            else
            {
                token = tokenMake('text',  prolog, realOffset);
                callback.apply(token, args);
                
                realOffset += prolog.length;
                if (tag_empty)
                {
                    token = tokenMake('empty', tag_empty, realOffset);
                }
                else if(tag_open)
                {
                    token = tokenMake('open', tag_open, realOffset);
                }
                else if(tag_close)
                {
                    token = tokenMake('close', tag_close, realOffset);
                }
                callback.apply(token, args);
            }
        };
        var matches;
        while ((matches = expr.exec(subject)) != null && matches[0] != '')
        {
            func.apply({}, matches);
        }
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
        var writingSpace = $.chili.whiteSpace.writingSpace;
        var result = text.replace(/ /g, writingSpace);
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
        var writingTab = $.chili.whiteSpace.writingTab;
        var result = text.replace(/\t/g, writingTab);
        return result;
    }
    
    /**
     * Returns the given text, with all '\n' replaced by the browser new 
     * line string
     * 
     * @param {String} text
     * 
     * @return String
     */
    function lineFeedsToNewLines( text ) 
    {
        var writingNewLine = $.chili.whiteSpace.writingNewLine;
        var result = text.replace(/\n/g, writingNewLine);
        return result;
    }
    
    /**
     * Returns the given text, with all the browser new line strings 
     * replaced by '\n' 
     * 
     * @param {String} text
     * 
     * @return String
     */
    function newLinesToLineFeeds( text ) 
    {
        var result = text;
        result = result.replace(/&nbsp;<BR>/ig, '\n');
        result = result.replace(/\r\n?/g, '\n');
        return result;
    }
    
    /**
     * Sets white space constants into $.chili
     * 
     * @param {String} html
     */
    function setWhiteSpaceConstants( html )
    {
        $.chili.whiteSpace.writingSpace = '&#160;';
        $.chili.whiteSpace.writingTab = repeat('&#160;', $.chili.whiteSpace.tabWidth);
        $.chili.whiteSpace.writingNewLine = '\n';
        if (/\r\n?/.test(html))
        {
            if ($.browser.msie)
            {
                $.chili.whiteSpace.writingNewLine = '&#160;<br>';
            }
            else
            {
                $.chili.whiteSpace.writingNewLine = /\r\n/.test(html) 
                    ? '\r\n' 
                    : '\r';
            }
        }
    }
    
    /**
     * Returns the given text after making new lines uniform across 
     * all browsers
     *
     * @param {String} text
     * 
     * @return String
     */
    function fixWhiteSpaceAfterReading( html )
    {
        setWhiteSpaceConstants(html);
        var result = newLinesToLineFeeds(html);
        if ( $.chili.whiteSpace.no1stLine ) 
        {
            result = result.replace(/^\n/, '');
        }
        return result;
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
        var result = [];
        scan(html, function () 
        {
            var value = this.value;
            if (this.type == 'text')
            {
                value = escapeSpaces( value );
                value = escapeTabs( value );
                value = lineFeedsToNewLines( value );
            }
            result.push(value);
        });
        result = result.join('');
        return result;
    }
    
    