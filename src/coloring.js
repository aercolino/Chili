        
        /**
         * Returns all the steps of the given blockName of the given recipe
         * 
         * @param {String} recipe
         * @param {String} blockName
         * 
         * @return Array
         */
        function prepareBlock( recipe, blockName ) 
        {
            var steps = [];
            var block = recipe[ blockName ];
            for( var stepName in block ) 
            {
                var prepared = prepareStep( recipe, blockName, stepName );
                steps.push( prepared );
            }
            return steps;
        }
        
        /**
         * Returns the number of sub matches in the given regular expression (as
         * a string)
         * 
         * @param {String} re
         * 
         * @return integer
         */
        function numberOfSubmatches( re )
        {
            var submatches = re
                .replace( /\\./g, "%" )     // disable any escaped character
                .replace( /\[.*?\]/g, "%" ) // disable any character class
                .match( /\((?!\?)/g )       // match any open parenthesis, not followed by a ?
            ;
            var result = (submatches || []).length;
            return result;
        }
        
        /**
         * Returns a step built from the given stepName of the given blockName 
         * of the given recipe
         * 
         * @param {String} recipe
         * @param {String} blockName
         * @param {String} stepName
         * 
         * @return Object
         */
        function prepareStep( recipe, blockName, stepName ) 
        {
            var step = recipe[ blockName ][ stepName ];
            var exp = ( typeof step._match == "string" ) 
                ? step._match 
                : step._match.source;
            var replacement = step._replace 
                ? step._replace 
                : '<span class="$0">$$</span>';
            var result = {
                recipe:      recipe,
                blockName:   blockName,
                stepName:    stepName,
                exp:         '(' + exp + ')', // new exp will have 1 more submatch
                length:      numberOfSubmatches( exp ) + 1,
                replacement: replacement
            };
            return result;
        }
        
        /**
         * Returns the given steps, with back references in the regular 
         * expression of each step renumbered according to the number of back 
         * references found in any previous step
         *
         * @param {Array} steps
         * 
         * @return Array
         */
        function adjustBackReferences( steps )
        {
            var prevLength = 1;
            var exps = [];
            for (var i = 0, iTop = steps.length; i < iTop; i++) {
                var exp = steps[ i ].exp;
                exp = exp.replace( /\\\\|\\(\d+)/g, 
                    function( m, aNum ) 
                    {
                        return !aNum ? m : "\\" + ( prevLength + 1 + parseInt( aNum, 10 ) );
                    } 
                );
                exps.push( exp );
                prevLength += steps[ i ].length;
            }
            return exps;
        }
        
        /**
         * Returns a regular expression built from all the given steps
         * 
         * @param {Array} steps
         * 
         * @return RegExp
         */
        function knowHow( steps, flags ) 
        {
            var prolog = '((?:\\s|\\S)*?)';
            var epilog = '((?:\\s|\\S)+)';
            var exps = adjustBackReferences( steps );
            var source = '(?:' + exps.join( '|' ) + ')';
            source = prolog + source + '|' + epilog;
            return new RegExp( source, flags );
        }
        
        /**
         * Returns the given replacement, after adding the given prefix to all 
         * classes of all SPANs
         * 
         * @param {String} prefix
         * @param {String} replacement
         * 
         * @return String
         */
        function addPrefix( prefix, replacement ) 
        {
            var lookFor = /(<span\s+class\s*=\s*(["']))((?:(?!__)\w)+\2\s*>)/ig;
            var replaceWith = '$1' + prefix + '__$3';
            var aux = replacement.replace( lookFor, replaceWith );
            return aux;
        }
        
        /**
         * Returns the step in the given steps and its matches in the given
         * allMatches
         * 
         * @param {Object} steps       the steps of a recipe
         * @param {Array}  allMatches  the corresponding matches
         * 
         * @return Object
         */
        function locateStepMatches( steps, allMatches )
        {
            var matchesIndex = 2;
            for (var i = 0, iTop = steps.length; i < iTop; i++)
            {
                var step = steps[ i ];
                var stepMatches = allMatches[ matchesIndex ];
                if (stepMatches) break;
                matchesIndex += step.length;
            }
            var matches  = allMatches.slice(matchesIndex, matchesIndex + step.length);
            matches.push( allMatches.index );
            matches.push( allMatches.input );
            return {step: step, matches: matches};
        }
        
        /**
         * Returns the replacement for the given stepMatches, based on the
         * function in stepMatches.step.replacement
         * 
         * @param {Object} stepMatches
         * 
         * @return String
         */
        function functionReplacement( stepMatches ) 
        {
            var that = 
            { 
                x: function( subject, module ) 
                { 
                    var result = applyModule( subject, module, stepMatches.step );
                    return result;
                }
            };
            var result = stepMatches.step.replacement.apply(that, stepMatches.matches);
            return result;
        }   
        
        /**
         * Returns the replacement for the given stepMatches, based on the
         * template in stepMatches.step.replacement
         * 
         * @param {Object} stepMatches
         * 
         * @return String
         */
        function templateReplacement( stepMatches )
        {
            var re = /(\\\$)|(?:\$\$)|(?:\$(\d+))/g;
            var substitution = function( m, escaped, K ) 
            {
                var result = '';
                if ( escaped )        /* \$ */ 
                {
                    result = "$";
                }
                else if ( !K )        /* $$ */ 
                {
                    result = escapeHtmlSpecialChars( stepMatches.matches[ 0 ] ); //stepMatches
                }
                else if ( K == "0" )  /* $0 */ 
                {
                    result = stepMatches.step.stepName;
                }
                else                  /* $K */
                {
                    result = escapeHtmlSpecialChars( stepMatches.matches[ K ] );
                }
                return result;
            };
            var result = stepMatches.step.replacement.replace(re, substitution);
            return result;
        }
        
        /**
         * Returns the replacement for any match found. This is a callback 
         * function passed to String.replace()
         * 
         * @return String
         */
        function chef( steps, replaceArgs ) 
        {
            var result = '';
            var anyMatch = replaceArgs[ 0 ];
            if (! anyMatch) return result;
            
            var epilog = replaceArgs[ replaceArgs.length - 1 ];
            if (epilog) {
                result = escapeHtmlSpecialChars( epilog );
                return result;
            }
            var stepMatches = locateStepMatches( steps, replaceArgs );
            result = $.isFunction(stepMatches.step.replacement)
                ? functionReplacement(stepMatches)
                : templateReplacement(stepMatches)
            ;
            var prolog = replaceArgs[ 1 ];
            prolog = escapeHtmlSpecialChars( prolog );
            result = addPrefix( stepMatches.step.recipe._name, result );
            result = prolog + result;
            return result;
        }
        
        /**
         * Returns the given subject, after replacing all the matches of the
         * given steps, of the given recipe
         *  
         * @param {String} subject
         * @param {Object} recipe
         * @param {Array}  steps
         * 
         * @return String
         */
        function applySteps( subject, recipe, steps )
        {
            var flags = recipe._case 
                ? "g" 
                : "gi";
            var expr = knowHow( steps, flags );
            var result = [];
            var matches;
            while ((matches = expr.exec(subject)) != null && matches[0] != '')
            {
                var element = chef(steps, matches);
                result.push(element);
            }
            result = result.join('');
            return result;
        }
        
        /**
         * Returns the given ingredients, after applying the given steName of
         * the given blockName of the given recipe to it
         * 
         * @param {String} ingredients
         * @param {Object} recipe
         * @param {String} blockName
         * @param {String} stepName
         * 
         * @return String
         */
        function cook( ingredients, recipe, blockName, stepName ) 
        {
            if (stepName) 
            {
                var step  = prepareStep(recipe, blockName, stepName);
                var steps = [step];
            }
            else
            {
                if (! blockName) 
                {
                    blockName = '_main';
                    checkSpices( recipe );
                }
                if (! blockName in recipe)
                {
                    return escapeHtmlSpecialChars( ingredients );
                }
                var steps = prepareBlock(recipe, blockName);
            }
            var result = applySteps(ingredients, recipe, steps);
            return result;
        }
        
        