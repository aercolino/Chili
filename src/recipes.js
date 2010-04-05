    
    /**
     * Returns the requested action according to the empty configuration of 
     * the given values
     * 
     * @param {String} recipeName
     * @param {String} blockName
     * @param {String} stepName
     * 
     * @return String
     */
    function requestedAction( recipeName, blockName, stepName ) 
    {
        if ( '' != stepName )   return 'applyStep';
        if ( '' != blockName )  return 'applyBlock';
        if ( '' != recipeName ) return 'applyRecipe';
        return '';
    }
    
    /**
     * Returns the interpretation of the given module into the given context
     * 
     * @param {String} module
     * @param {Object} context
     * 
     * @return Object
     */
    function detectAction( module, context )
    {
        if (! module)   return;
        var re = new RegExp('^(?!(?:/$|.+/$|.+//$|.+//.))([^/]*)(?:/([^/]*)(?:/([^/]+))?)?$');
        var matches = (module || '').match(re);
        if (! matches)  return; // Expected recipe[/block[/step]] module format
        var recipeName = matches[1] || '';
        var blockName  = matches[2] || '';
        var stepName   = matches[3] || '';
        var action = requestedAction( recipeName, blockName, stepName );
        var recipe = getRecipe( recipeName, context );
        var result = {
              action:     action
            , recipeName: recipeName 
            , blockName:  blockName
            , stepName:   stepName
            , recipe:     recipe
            , module:     module
            , context:    context
        };
        return result;
    }
    
    /**
     * Returns the cached recipe with the given recipeName if recipeName is 
     * not empty, else the recipe from context
     * 
     * @param {String} recipeName
     * @param {Object} context
     * 
     * @return Object
     */
    function getRecipe( recipeName, context ) 
    {
        var recipe = null;
        if ( '' == recipeName )
        {
            recipe = context.recipe;
        }
        else 
        {
            recipe = $.chili.recipes[ recipeName ];
        }
        return recipe;
    }
    
    /**
     * Downloads a recipe by means of an ajax call and, on success, applies 
     * the cbFunction callback, passing it all cbData array elements as 
     * arguments, to any element waiting for being highlighted on the queue 
     * of the recipe identified by path
     *
     * @param {String} path
     * @param {Function} cbFunction
     * @param {Array} cbData
     */
    function downloadRecipe( path, cbFunction, cbData )
    {
        $.chili.queue[ path ] = [];
        $.getScript( path, function( recipeLoaded ) 
        {
            var recipeName = getRecipeName( path );
            var q = $.chili.queue[ path ];
            for( var i = 0, iTop = q.length; i < iTop; i++ )
            {
                var el = q[ i ];
                if ('undefined' != typeof el.selector) 
                {
                    el = $(el.selector)[0];
                }
                $(el).trigger( 'chili.before_coloring', [recipeName] );
                cbFunction.apply(q[ i ], cbData);
                $(el).trigger( 'chili.after_coloring', [recipeName] );
            }
        } );
    }
    
    /**
     * Returns the result of applying the given detected recipe to the given
     * subject
     * 
     * @param {String} subject
     * @param {Object} detected
     * 
     * @return String
     */
    function applyRecipe( subject, detected )
    {
        var recipe = detected.recipe;
        result = cook(subject, recipe);
        return result;
    }
    
    /**
     * Returns the result of applying the given detected block to the given
     * subject
     * 
     * @param {String} subject
     * @param {Object} detected
     * 
     * @return String
     */
    function applyBlock( subject, detected )
    {
        var blockName = detected.blockName;
        var recipe    = detected.recipe;
        if (! (blockName in recipe)) 
        {
            result = escapeHtmlSpecialChars(subject);
        }
        else
        {
            result = cook(subject, recipe, blockName);
        }
        return result;
    }
    
    /**
     * Returns the result of applying the given detected step to the given
     * subject
     * 
     * @param {String} subject
     * @param {Object} detected
     * 
     * @return String
     */
    function applyStep( subject, detected )
    {
        var recipeName = detected.recipeName;
        var blockName  = detected.blockName;
        var stepName   = detected.stepName;
        var recipe     = detected.recipe;
        var context    = detected.context;
        if ('' == blockName) 
        {
            blockName = context.blockName;
        }
        if (false
            || ! (blockName in recipe)
            || ! (stepName  in recipe[blockName]))
        {
            result = escapeHtmlSpecialChars(subject);
        }
        else
        {
            result = cook(subject, recipe, blockName, stepName);
        }
        return result;
    }
    
    /**
     * Returns the result of applying the given detected action to the given
     * subject
     * 
     * @param {String} subject
     * @param {Object} detected
     * 
     * @return String
     */
    function applyAction( subject, detected )
    {
        var result = '';
        var action = detected.action;
        switch (action)
        {
            case 'applyRecipe':
                result = applyRecipe(subject, detected);
            break;
            case 'applyBlock':
                result = applyBlock(subject, detected);
            break;
            case 'applyStep':
                result = applyStep(subject, detected);
            break;
            default:
                //nothing to do
            break;
        }
        return result;
    }
    
    /**
     * Returns the result of applying the given detected action to the given
     * subject
     * 
     * @param {String} subject
     * @param {Object} detected
     * 
     * @return String
     */
    function applyDeferred( subject, detected )
    {
        // dynamic setups come here too
        var path = getRecipePath(detected.recipeName);
        if (! $.chili.queue[ path ]) 
        {
            downloadRecipe(path, replaceElement);
        }
        var cue = 'chili_' + unique();
        $.chili.queue[ path ].push( {
            selector: '#' + cue, 
            subject:  subject, 
            module:   detected.module, 
            context:  detected.context
        } );
        result = '<span id="' + cue + '">' + result + '</span>';
        return result;
    }

    /**
     * Returns the result of applying the given module to the given subject 
     * into the given context
     * 
     * @param {String} subject
     * @param {String} module
     * @param {Object} context
     * 
     * @return String
     */
    function applyModule( subject, module, context ) 
    {
        var result = '';
        var detected = detectAction(module, context);
        if (typeof detected == 'undefined')
        {
            result = escapeHtmlSpecialChars(subject);
        }
        else if (detected.recipe)
        {
            result = applyAction(subject, detected);
        }
        else if ( $.chili.dynamic.active ) 
        {
            result = applyDeferred(subject, detected);
        }
        else
        {
            result = escapeHtmlSpecialChars(subject);
        }
        return result;
    }
    
    /**
     * Returns a unique number. If the given text is not undefined the 
     * return value is guaranteed to be unique inside text
     * 
     * @param {String} text
     * 
     * @return Integer
     */
    function unique( text ) 
    {
        var result = (new Date()).valueOf();
        while( text && text.indexOf( result ) > -1 );
        { 
            result = (new Date()).valueOf();
        }
        return result;
    }
    
    