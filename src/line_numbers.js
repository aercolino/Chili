    
    /**
     * If needed, adds line numbers with a proper start to the given 
     * dom_element
     * 
     * @param {Element} dom_element
     */
    function checkLineNumbers( dom_element )
    {
        var ln = $.chili.codeLineNumbers(dom_element);
        if ( ln ) 
        {
            addLineNumbers( dom_element );
            setLineNumbersStart.apply( dom_element, ln );
        }
        else if ( $.chili.decoration.lineNumbers ) 
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
        function setLineNumbersStart( all, groupStart, groupId )
        {
            var start = parseInt( groupStart, 10 );
            if ( groupId ) 
            {
                var $pieces = $( '.' + all );
                var pos = $pieces.index( this );
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
            $(this).find( 'ol' ).attr('start', start);
            // refresh the window
            $('body')
                .width( $('body').width() - 1 )
                .width( $('body').width() + 1 )
            ;
        }
        
        /**
         * Converts lines inside the given dom_element to list items into an
         * ordered list element
         * 
         * @param {Element} dom_element
         */
        function addLineNumbers( dom_element ) 
        {
            var html = $( dom_element ).html();
            var expr = new RegExp('(.*?)' + $.chili.readingEOL, 'ig');
            var listItems = html.replace(expr, '<li>$1</li>');
            listItems = listItems.replace(/(<span [^>]+>)(.*?)(<\/span>)/ig, 
                    function( all, openSpan, insideSpan, closeSpan ) 
                    {
                        insideSpan = insideSpan.replace(/<\/li><li>/ig, closeSpan + '$&' + openSpan);
                        var result = openSpan + insideSpan + closeSpan;
                        return result;
                    }
            );
            var result = '<ol>' + listItems + '</ol>';
            dom_element.innerHTML = result;
        }
    }
