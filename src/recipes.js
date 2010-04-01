        
        /**
         * Returns the result of applying the given recipe to the given subject
         * 
         * @param {String} subject
         * @param {Object} recipe
         * 
         * @return String
         */
        function applyRecipe( subject, recipe ) 
        {
            var result = cook( subject, recipe ); 
            return result;
        }

        /**
         * Returns the result of applying the given blockName of the given 
         * recipe to the given subject
         * 
         * @param {String} subject
         * @param {Object} recipe
         * @param {String} blockName
         * 
         * @return String
         */
        function applyBlock( subject, recipe, blockName ) 
        {
            var result = cook( subject, recipe, blockName ); 
            return result;
        }

        /**
         * Returns the result of applying the given stepName of the given 
         * blockName of the given recipe to the given subject
         * 
         * @param {String} subject
         * @param {Object} recipe
         * @param {String} blockName
         * @param {String} stepName
         * 
         * @return String
         */
        function applyStep( subject, recipe, blockName, stepName ) 
        {
            var step = prepareStep( recipe, blockName, stepName );
            var steps = [step];
            var flags = recipe._case 
                ? "g" 
                : "gi";
            var perfect = subject.replace( knowHow( steps, flags ), 
                function() 
                {
                    var args = Array.prototype.slice.call(arguments);
                    return chef(steps, args);
                } 
            );
            return perfect;
        }
        
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
            var action     = detected['action'];
            var recipeName = detected['recipeName'];
            var blockName  = detected['blockName'];
            var stepName   = detected['stepName'];
            var recipe     = detected['recipe'];
            var context    = detected['context'];
            var result = escapeHtmlSpecialChars( subject );
            switch (action)
            {
                case 'applyRecipe':
                    return applyRecipe( subject, recipe );
                break;
                case 'applyBlock':
                    if (! (blockName in recipe))            return result;
                    return applyBlock( subject, recipe, blockName );
                break;
                case 'applyStep':
                    if ('' == blockName) 
                    {
                        blockName = context.blockName;
                    }
                    if (! (blockName in recipe))            return result;
                    if (! (stepName  in recipe[blockName])) return result;
                    return applyStep( subject, recipe, blockName, stepName );
                break;
                default:
                    //nothing to do
                break;
            }
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
            var result = escapeHtmlSpecialChars( subject );
            var detected = detectAction( module, context );
            if (typeof detected == 'undefined') return result;
            if (detected['recipe'])
            {
                result = applyAction(subject, detected);
                return result;
            }
            var path = getRecipePath( detected['recipeName'] );
            if ( $.chili.dynamic.active ) 
            {
                // dynamic setups come here too
                if (! $.chili.queue[ path ]) 
                {
                    downloadRecipe(path, replaceElement);
                }
                var cue = 'chili_' + unique();
                $.chili.queue[ path ].push( {
                    selector: '#' + cue, 
                    subject:  subject, 
                    module:   module, 
                    context:  context
                } );
                result = '<span id="' + cue + '">' + result + '</span>';
                return result;
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
        
        