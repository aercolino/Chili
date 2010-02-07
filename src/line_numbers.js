    
    /**
     * If needed, adds line numbers with a proper start to the given 
     * dom_element
     * 
     * @param {Element} dom_element
     */
    function checkLineNumbers( dom_element )
    {
        var $that = $(dom_element).parent();
        var classes = $that.attr( 'class' );
        var ln = /ln-(\d+)-([\w][\w\-]*)|ln-(\d+)|ln-/.exec( classes );
        if ( ln ) 
        {
            addLineNumbers( dom_element );
            setLineNumbersStart.apply( dom_element, ln );
        }
        else if ( $.chili.options.lineNumbers ) 
        {
            addLineNumbers(dom_element);
        }
        return;
        
        /**
         * Sets the start of the ol tag of the current DOM element
         * 
         * @param {String} groupStart
         * @param {String} groupId
         * @param {String} start
         */
        function setLineNumbersStart( groupStart, groupId, start )
        {
            if ( groupStart ) 
            {
                start = parseInt( groupStart, 10 );
                var $pieces = $( '.ln-' + groupStart + '-' + groupId );
                var $that = $(this).parent();
                var pos = $pieces.index( $that[0] );
                $pieces
                    .slice( 0, pos )
                    .each( 
                        function() 
                        {
                            start += $( this ).find( 'li' ).length;
                        } 
                    )
                ;
            }
            else if ( start ) 
            {
                start = parseInt( start, 10 );
            }
            else 
            {
                start = 1;
            }
            $(this).find( 'ol' )[0].start = start;
            // the following should refresh the window
            $('body')
                .width( $('body').width() - 1 )
                .width( $('body').width() + 1 )
            ;
        }
        
        /**
         * Converts lines inside the given dom_element to list items
         * 
         * @param {Element} dom_element
         */
        function addLineNumbers( dom_element ) 
        {
            var result = $( dom_element ).html();
            result = extractImmediateBreaksInsideSpans(result);
            result = convertLinesInsideSpans(result);
            result = convertRemainingLines(result);
            result = fillEmptyListItems(result);
            result = '<ol>' + result + '</ol>';
            dom_element.innerHTML = result;
        }
        
    	/**
         * Returns a list item that wraps he given textBeforeLastLine or 
         * lastLine
         * 
         * @param {String} lineBeforeLastLine
         * @param {String} textBeforeLastLine
         * @param {String} lastLine
         * @param {String} openSpan
         * 
         * @return String
         */
        function makeListItem( lineBeforeLastLine, textBeforeLastLine, lastLine, openSpan ) 
        {
            var closeSpan = openSpan ? '</span>' : '';
            var result = '';
            if (lineBeforeLastLine) 
            {
                result = '<li>' + openSpan + textBeforeLastLine + closeSpan + '</li>';
            }
            else if (lastLine) 
            {
                result = '<li>' + openSpan + lastLine + closeSpan + '</li>';
            }
            return result;
        }
        
        /**
         * Returns the given html, after moving out of the spans their immediate
         * breaks, if any
         * 
         * @param {String} html
         * 
         * @return String
         */
        function extractImmediateBreaksInsideSpans( html )
        {
            var expr = /(<span [^>]+>)((?:(?:&nbsp;|\xA0)<br>)+)(.*?)(<\/span>)/ig;
            var repl = '$2$1$3$4';
            var result = html.replace( expr, repl );
            return result;
        }
        
        /**
         * Returns the given html, after wrapping each line inside spans with an
         * <li> element
         * 
         * @param {String} html
         * 
         * @return String
         */
        function convertLinesInsideSpans( html )
        {
            var expr = /(.*?)(<span .*?>)(.*?)(?:<\/span>(?:&nbsp;|\xA0)<br>|<\/span>)/ig;
            var repl = function( all, anythingBeforeSpan, openSpan, anythingInsideSpan ) 
            {
                if (! /<br>/i.test(anythingInsideSpan)) 
                {
                    return all;
                }
                var expr = /((.*?)(?:&nbsp;|\xA0)<br>)|(.*)/ig;
                var repl = function( all, lineBeforeLastLine, textBeforeLastLine, lastLine ) 
                {
                    var result = makeListItem(lineBeforeLastLine, textBeforeLastLine, lastLine, openSpan);
                    return result;
                };
                var result = anythingBeforeSpan + anythingInsideSpan.replace(expr, repl);
                return result;
            };
            var result = html.replace(expr, repl);
            return result;
        }
        
        /**
         * Returns the given html, after wrapping each remaining line with an
         * <li> element
         * 
         * @param {String} html
         * 
         * @return String
         */
        function convertRemainingLines( html ) 
        {
            var expr = /(<li>.*?<\/li>)|((.*?)(?:&nbsp;|\xA0)<br>)|(.+)/ig;
            var repl = function( all, prev_li, lineBeforeLastLine, textBeforeLastLine, lastLine ) 
            {
                if (prev_li) 
                {
                    return all;
                }
                var result = makeListItem(lineBeforeLastLine, textBeforeLastLine, lastLine, '');
                return result;
            };
            var result = html.replace(expr, repl);
            return result;
        }
        
        /**
         * Returns the given html, after filling each empty <li> element with a
         * space replacement
         * 
         * @param {String} html
         * 
         * @return String
         */
        function fillEmptyListItems( html )
        {
            var expr = /<li><\/li>/ig;
            var repl = '<li>' + $.chili.replaceSpace + '</li>';
            var result = html.replace( expr, repl );
            return result;
        }
    }
