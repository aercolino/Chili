        
        /**
         * 
         */
        function makeTagsSpanOneLine( html )
        {
            var open  = [];
            var close = [];
            var expr = /(.*)\n/g;
            var func = function ( all, line ) 
            {
                var open_start = open.join('');
                scan(line, function()
                {
                    if (this.type == 'open')
                    {
                        open.push(this.value);
                    }
                    else if (this.type == 'close')
                    {
                        open.pop();
                    }
                });
                for (var i = 0, iTop = open.length; i < iTop; i++)
                {
                    var tag_open  = open[i];
                    var tag_close = tag_open.replace(/^<(\w+)[^>]*>$/, '</$1>');
                    close.unshift(tag_close);
                }
                var close_end = close.join('');
                var result = open_start + line + close_end + '\n';
                return result;
            };
            var result = html.replace(expr, func);
            return result;
        }
        
        /**
         * Converts lines inside the given dom_element to list items into an
         * ordered list element
         * 
         * @param {Element} dom_element
         */
        function makeUnorderedList( html )
        {
            var expr = /(.*)\n/g;
            var result = html.replace(expr, '<li>$1 </li>'); //leave a space to account for empty lines
            result = '<ol class="chili-ln-off">' + result + '</ol>';
            return result;
        }
        
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
         * Make line numbers appear into the given dom_element
         * 
         * @param {Element} dom_element
         */
        function addLineNumbers( dom_element ) 
        {
            $(dom_element).children('ol').removeClass('chili-ln-off');
        }
        
        /**
         * If needed, adds line numbers with a proper start to the given 
         * dom_element
         * 
         * @param {Element} dom_element
         */
        function checkLineNumbers( dom_element )
        {
            var ln = $.chili.codeLineNumbers(dom_element);
            if (ln) 
            {
                addLineNumbers(dom_element);
                setLineNumbersStart.apply(dom_element, ln);
            }
            else if ($.chili.decoration.lineNumbers) 
            {
                addLineNumbers(dom_element);
            }
        }
        
        