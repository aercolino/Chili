    
    /**
     * Returns the recipe path from the given recipeName
     * 
     * @param {String} recipeName
     * 
     * @return String
     */
    function getRecipePath( recipeName ) 
    {
        var result = $.chili.dynamic.origin + 'jquery.chili.recipes.' + recipeName + '.js';
        return result;
    }
    
    /**
     * Returns the recipe name from the given recipePath
     * 
     * @param {String} recipePath
     * 
     * @return String
     */
    function getRecipeName( recipePath )
    {
        var matches = recipePath.match(/\bjquery\.chili\.recipes\.([\w-]+)\.js$/i);
        var result = matches[1];
        return result;
    }
    
    /**
     * Detects the recipe to use for highlighting the given DOM element and 
     * makes it happen, for static and dynamic setups
     * 
     * @param {Element} dom_element
     */
    function askDish( dom_element ) 
    {
        var recipeName = $.chili.codeLanguage( dom_element );
        if ( '' == recipeName )
            return;
        var path = getRecipePath( recipeName );
        if ( $.chili.dynamic.active && ! $.chili.recipes[ recipeName ] ) 
        {
            // dynamic setups come here
            if ( ! $.chili.queue[ path ] ) 
            {
                downloadRecipe(path, makeDish, [path]);
            }
            $.chili.queue[ path ].push( dom_element );
        }
        else 
        {
            // static setups come here
            $(dom_element).trigger( 'chili.before_coloring', [recipeName] );
            makeDish.apply( dom_element, [path] );
            $(dom_element).trigger( 'chili.after_coloring', [recipeName] );
        }
    }
    
    /**
     * Highlights the current DOM element using the recipe identified by the
     * given recipePath
     */
    function makeDish( recipePath ) 
    {
        var recipeName = getRecipeName(recipePath);
        var recipe = $.chili.recipes[ recipeName ];
        if (! recipe) 
            return;
        var ingredients = $( this ).text();
        if (! ingredients) 
            return;
        ingredients = fixWhiteSpaceAfterReading(ingredients);
        replaceElement.apply({
            selector: this, 
            subject:  ingredients, 
            module:   recipeName, 
            context:  {}
        });
        fixTextSelection(this);
        checkLineNumbers(this);
    }
    
    /**
     * Replaces source code in the given DOM element with its highlighted 
     * version
     */
    function replaceElement()
    {
        filtersPrepare(this);
        var replacement = applyModule( this.subject, this.module, this.context );
        replacement = filtersProcess(this, replacement);
        
        replacement = fixWhiteSpaceBeforeWriting( replacement );
        
        var dom_element = $( this.selector )[0];
        dom_element.innerHTML = replacement;
    }
    
    