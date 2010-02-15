    
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
        function setLineNumbersStart( all, groupStart, groupId, start )
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
         * Converts lines inside the given dom_element to list items into an
         * ordered list element
         * 
         * @param {Element} dom_element
         */
        function addLineNumbers( dom_element ) 
        {
            var html = $( dom_element ).html();
            var listItems = html.replace(/(.*?)<br>/ig, '<li>$1</li>');
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
