    
    $.extend({
    	chili: {
    		options: {  
                whiteSpace: {
                    tabWidth:  4,    //spaces
                    no1stLine: true  //if empty
                },
                automatic: {
                    active:    true,
                    selector:  "code",
                    context:   document
                },
    	        dynamic: {
                    active:    true,
                    origin:    ''    //used like: recipeFolder + recipeName + '.js'
                },
                decoration: {
                    lineNumbers: !true
                },
                selection: {
                    active:    true,
                    box: {
                        style: [ 
                            "position:absolute; z-index:3000; overflow:scroll;",
                            "width:16em;",
                            "height:9em;",
                            "border:1px solid gray;",
                            "padding:1em;",
                            "background-color:white;"
                        ].join(' '),
                        top:   function(pageX, pageY, width, height)
                        {
                            var result = pageY - Math.round( height / 2 );
                            return result;
                        },
                        left:  function(pageX, pageY, width, height)
                        {
                            var result = pageX /*- Math.round( width / 2 )*/;
                            return result;
                        }
                    }
                }
        	}
    	}
    });
    
    