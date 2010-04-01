        
        /**
         * Wraps a given line into well formed open and close tags, based on the
         * given open stack
         * 
         * @param {String} line
         * @param {Array} open
         * 
         * @return Object
         */
        function well_form( line, open )
        {
            var close = [];
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
            line = open_start + line + close_end;
            return {
                line:  line,
                open:  open
            };
        }
        
        /**
         * Converts lines inside the given dom_element to list items into an
         * ordered list element
         * 
         * @param {Element} dom_element
         * 
         * @return String
         */
        function makeOrderedList( html )
        {
            var open  = [];
            var expr = /(.*)\n/g;
            var func = function ( all, line ) 
            {
                var well_formed = well_form(line, open);
                open = well_formed.open;
                //leave a space to account for empty lines
                line = '<li>' + well_formed.line + ' </li>'; 
                return line;
            };
            var result = html.replace(expr, func);
            result = '<ol>' + result + '</ol>';
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
            var html = $(dom_element).html();
            html = makeOrderedList( html );
            dom_element.innerHTML = html;
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
        
        