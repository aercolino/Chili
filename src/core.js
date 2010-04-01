
    /**
     * Highlights currently selected elements accordingly to the given options
     * 
     * @param {Object} options
     */
    $.fn.chili = function( options ) 
    {
        var globals = $.extend({}, $.chili);
        $.chili = $.extend( true, $.chili, options || {} );
        this.each(function() 
        {
            askDish( this );
        });
        $.chili = globals;
        return this;
    };
