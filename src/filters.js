    
    /**
     * Makes filters from tags into that.subject, adds those filters to that 
     * and cleans up that.subject
     * 
     * @param {Object} that
     */
    function filtersPrepare( that )
    {
        var subject = that.subject;
        if (! /{:\w+\(/.test(subject))
        {
            return;
        }
        var format = 0;
        var expr = /({:(\w+)\((|(?:(['"])[^\4\n]*(?:\\.[^\4\n]*)*\4)(?:\s*,\s*((['"])[^\6\n]*(?:\\.[^\6\n]*)*\6))*)\)\[)((?:.|\n)*?)(\]\2:})/g;
        var func = function(all, tag_open, callback, args, ignore4, ignore5, ignore6, target, tag_close, offset)
        {
            eval('args = [' + args + '];');
            var filter = {
                original: target,
                start:    offset - format, 
                count:    target.length, 
                callback: callback, 
                args:     args
            };
            format += tag_open.length + tag_close.length;
            if ($.isArray(that.filters))
            {
                that.filters.push(filter);
            }
            else
            {
                that.filters = [filter];
            }
            return target;
        };
        subject = escapeHtmlSpecialChars(subject);
        subject = subject.replace(expr, func);
        subject = unescapeHtmlSpecialChars(subject);
        that.subject = subject;
    }
    
    /**
     * Makes up a token object based on the given type, value and start
     * 
     * @param {String} type
     * @param {String} value
     * @param {Integer} start
     * 
     * @return Object
     */
    function tokenMake( type, value, start )
    {
        var result = {
            type:  type,
            value: value,
            start: start
        };
        return result;
    }
    
    /**
     * Splits the given html into its tags and texts
     * 
     * @param {String} html
     * 
     * @return Array
     */
    function tokenSplit( html )
    {
        var result = [];
        var format = 0;
        scan(html, function() 
        {
            switch (this.type)
            {
                case 'empty':
                case 'open':
                case 'close':
                    format += this.value.length;
                break;
                case 'text':
                    this.start -= format;
                    this.end = this.start + this.value.length;
                break;
                default:
                    throw "no type case for '" + this.type + "'";
                break;
            }
            result.push(this);
        });
        return result;
    }
    
    /**
     * Strips empty span tags from the given html
     * 
     * @param {String} html
     * 
     * @return String
     */
    function stripEmpties( html )
    {
        var result = html.replace(/<span[^>]+><\/span>/g, '');
        return result;
    }
    
    /**
     * Joins values of all tokens
     * 
     * @param {Array} tokens
     * 
     * @return String
     */
    function tokenJoin( tokens )
    {
        var result = [];
        for (var i = 0, iTop = tokens.length;  i < iTop;  i++)
        {
            result.push(tokens[i].value);
        }
        result = result.join('');
        result = stripEmpties(result);
        return result;
    }
    
    /**
     * Finds beginning and ending tokens in the given tokens that contain the
     * begin and end of the string that starts at the given start and whose 
     * length is the given count
     * 
     * @param {Array} tokens
     * @param {Integer} start
     * @param {Integer} count
     * 
     * @return {Object}
     */
    function tokenFind( tokens, start, count )
    {
        var end = start + count;
        var firstPos     = -1;
        var lastPos      = -1;
        var previousSpan = '';
        var firstSpan    = '';
        var lastSpan     = '';
        for (var i = 0, iTop = tokens.length;  i < iTop;  i++)
        {
            var token = tokens[i];
            if (token.type == 'open')
            {
                previousSpan = token.value;
            }
            else if (token.type == 'close')
            {
                previousSpan = '';
            }
            else
            {
                if (token.start <= start && start < token.end)
                {
                    firstPos = i;
                    firstSpan = previousSpan;
                }
                if (token.start <= end && end < token.end)
                {
                    lastPos = i;
                    lastSpan = previousSpan;
                }
                if (firstPos != -1 && lastPos != -1)
                {
                    break;
                }
            }
        }
        var result = {
            first: {
                position: firstPos, 
                span: firstSpan
            }, 
            last: {
                position: lastPos, 
                span: lastSpan
            }
        };
        return result;
    }
    
    /**
     * Returns the tokens that result from breaking in two given token at the 
     * given position; if the given span is not empty, two additional tokens are 
     * returned to leave the sequence well formed
     * 
     * @param {Object} token
     * @param {Integer} position
     * @param {String} span
     * 
     * @return {Object}
     */
    function tokenBreak( token, position, span )
    {
        var firstText = token.value.substr(0, position);
        var firstToken = tokenMake('text', firstText, token.start);
        firstToken.end = token.start + firstText.length;
        
        var secondText = token.value.substr(position);
        var secondToken = tokenMake('text', secondText, token.start + position);
        secondToken.end = token.start + position + secondText.length;
        
        var result = { 
            first:  [firstToken], 
            second: [secondToken] 
        };
        if (span)
        {
            result.first.push(tokenMake('close', '</span>'));
            result.second.unshift(tokenMake('open', span));
        }
        return result;
    }
    
    /**
     * Creates a new html token out of the given tokens and insert it at the 
     * right position into them. The token contains all the string that starts 
     * at the given start and whose length is the given count. 
     * Resulting tokens are well formed.
     * 
     * @param {Array} tokens
     * @param {Integer} start
     * @param {Integer} count
     * 
     * @return {Object}
     */
    function tokenExtract( tokens, start, count )
    {
        var end = start + count;
        
        var found = tokenFind(tokens, start, count);
        var beforeTokens = tokens.slice(0, found.first.position);
        var firstToken   = tokens[found.first.position];
        var middleTokens = tokens.slice(found.first.position + 1, found.last.position);
        var lastToken    = tokens[found.last.position];
        var afterTokens  = tokens.slice(found.last.position + 1);
        
        var firstTokens = tokenBreak(firstToken, start - firstToken.start, found.first.span);
        var lastTokens  = tokenBreak(lastToken,  end   - lastToken.start,  found.last.span);
        
        var newValue = [].concat(
            firstTokens.second, 
            middleTokens, 
            lastTokens.first
        );
        newValue = tokenJoin(newValue);
        var newToken = tokenMake('html', newValue, start);
        
        tokens = [].concat(
            beforeTokens, 
            firstTokens.first, 
            newToken, 
            lastTokens.second, 
            afterTokens
        );
        var result = {
            tokens:   tokens,
            position: beforeTokens.length + firstTokens.first.length
        };
        return result;
    }
    
    /**
     * Applies all the filters of the given that to the given html
     * 
     * @param {Object} that
     * @param {String} html
     * 
     * @return String
     */
    function filtersProcess( that, html )
    {
        var result = html;
        if (! that.filters)
        {
            return result;
        }
        var tokens = [];
        for (var i = 0, iTop = that.filters.length; i < iTop; i++ )
        {
            var filter = that.filters[i];
            var callback = $.chili.filters && $.chili.filters[ filter.callback ];
            if (! (callback && $.isFunction(callback)))
            {
                continue;
            }
            if (0 == tokens.length)
            {
                tokens = tokenSplit(html);
            }
            var extraction = tokenExtract(tokens, filter.start, filter.count);
            tokens = extraction.tokens;
            var position = extraction.position;
            var filterInput = {
                text: filter.original,
                html: tokens[ position ].value
            };
            var args = filter.args;
            var filterOutput = callback.apply(filterInput, args);
            tokens[ position ].value = filterOutput;
        }
        if (0 < tokens.length)
        {
            result = tokenJoin(tokens);
        }
        return result;
    }
    
    