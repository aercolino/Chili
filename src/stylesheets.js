        
        /**
         * Returns a CSS class definition with the given className and the given
         * classStyle
         *
         * @param {String} className
         * @param {String} classStyle
         * 
         * @return String
         */
        function cssClassDefinition( className, classStyle )
        {
            var result = ''
                + '.' + className + '\n'
                + '{\n' 
                + '\t' + classStyle + '\n'
                + '}\n'
            ;
            return result;
        }
        
        /**
         * Returns the style sheet of the given recipe
         *
         * @param {Object} recipe
         * 
         * @return string
         */
        function makeStylesheet( recipe )
        {
            var name = recipe._name;
            var content = ['/* Chili -- ' + name + ' */'];
            for (var blockName in recipe) 
            {
                if ( blockName.search( /^_(?!main\b)/ ) >= 0 ) 
                    continue; // if _bar but not _main nor foo
                var block = recipe[ blockName ];
                for (var stepName in block) 
                {
                    var step = block[ stepName ];
                    if (! '_style' in step) 
                        continue;
                    var style_def = step[ '_style' ];
                    if ( typeof style_def == 'string' ) 
                    {
                        var oStyle = {};
                        oStyle[ stepName ] = style_def;
                        style_def = oStyle;
                    }
                    for (var className in style_def) 
                    {
                        var stepClass = name + '__' + className;
                        var stepStyle = style_def[ className ];
                        var def = cssClassDefinition( stepClass, stepStyle );
                        content.push(def);
                    }
                }
            }
            var result = content.join('\n');
            return result;
        }
        
        /**
         * If needed, generates and loads the style sheet of the given recipe 
         * into the current page
         * 
         * @param {Object} recipe
         */
        function checkSpices( recipe ) 
        {
            var name = recipe._name;
            if ( ! $.chili.queue[ name ] ) 
            {
                var stylesheet = makeStylesheet(recipe);
                $.chili.loadStylesheetInline(stylesheet);
                $.chili.queue[ name ] = true;
            }
        }
        
        