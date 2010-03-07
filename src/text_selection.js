    
    /**
     * When a user selects highlighted text, IE and FF returns a mess: this
     * function displays a minimal dialog with the selected text, cleaned up 
     */
    function fixTextSelection( dom_element )
    {
        //chrome, opera, and safari select PRE text correctly 
        if ($.chili.selection.active && ($.browser.msie || $.browser.mozilla)) 
        {
            var element = null;
            $(dom_element)
                .parents()
                .filter("pre")
                .bind("mousedown", resetSelectedTextElement)
                .bind("mouseup", displaySelectedTextDialog)
            ;
        }
        return;
        
        /**
         * Clears anything that was selected before
         */
        function clearPreviousSelection()
        {
        	if ($.browser.msie) 
            {
                document.selection.empty();
            }
            else
            {
                window.getSelection().removeAllRanges();
            }
        }
        
        /**
         * Resets the currently selected element
         * 
         * This is later used to check that the user selected text from
         * the same element
         */
        function resetSelectedTextElement() 
        {
            element = this;
            clearPreviousSelection();
        }
        
        /**
         * Returns the text selected by the user
         */
        function getSelectedText()
        {
        	var result = $.browser.msie 
        		? document.selection.createRange().htmlText
				: window.getSelection().toString();
    		return result;
        }
        
        /**
         * Returns the given html after replacing any HTML break and block by a 
         * new line
         *
         * @param {String} html
         * 
         * @return String 
         */
        function preserveNewLines( html )
        {
            var newline_flag = unique(html);
            var text = '';
            if (/<br/i.test(html) || /<li/i.test(html)) 
            {
                if (/<br/i.test(html)) 
                {
                    html = html.replace( /\<br[^>]*?\>/ig, newline_flag );
                }
                else if (/<li/i.test(html)) 
                {
                    html = html.replace( /<ol[^>]*?>|<\/ol>|<li[^>]*?>/ig, '' ).replace( /<\/li>/ig, newline_flag );
                }
                var el = $( '<pre>' ).appendTo( 'body' ).hide()[0];
                el.innerHTML = html;
                text = $( el ).text().replace( new RegExp( newline_flag, "g" ), '\r\n' );
                $( el ).remove();
            }
            return text;
        }
        
        /**
         * Returns the given text, after removing garbage characters
         */
        function cleanText( text )
        {
        	var result = $.browser.msie
        		? preserveNewLines(text)
				: text
                    .replace( /\r/g, '' )
                    .replace( /^# ?/g, '' )
                    .replace( /\n# ?/g, '\n' );
    		return result;
        }
        
        /**
         * Shows a dialog containing the given text
         */
        function makeDialog( selected, event )
        {
            var boxOptions = $.chili.selection.box;
        	var boxTag = $.browser.msie
        		? ('<textarea style="' + boxOptions.style + '">')
				: ('<pre style="' + boxOptions.style + '">');
        		
    		var boxElement = $(boxTag)
                .appendTo( 'body' )
                .text( selected )
                .attr( 'id', 'chili_selection' )
                .click( function() { $(this).remove(); } )
            ;
            var top  = boxOptions.top(event.pageX, event.pageY, 
                    boxElement.width(), boxElement.height());
            var left = boxOptions.left(event.pageX, event.pageY, 
                    boxElement.width(), boxElement.height());
            boxElement.css( { top: top, left: left } );
                
        	return boxElement;
        }
        
        /**
         * Selects the text in the given $container
         */
        function selectTextAgain($container)
        {
        	if ($.browser.msie) 
            {
                $container[0].focus();
                $container[0].select();
            }
            else 
            {
                var s = window.getSelection();
                s.removeAllRanges();
                var r = document.createRange();
                r.selectNodeContents( $container[0] );
                s.addRange( r );
            }
        }
        
        /**
         * Shows a dialog containing the text selected by the user
         */
        function displaySelectedTextDialog( event ) 
        {
            if (! (element && element == this)) 
            {
            	return;
            }
            element = null;
            
            var selectedText = getSelectedText();
            if ( '' == selectedText ) 
            { 
                return;
            }
            selectedText = cleanText(selectedText);
            
            var $container = makeDialog(selectedText, event);
            selectTextAgain($container);
        }
    }
