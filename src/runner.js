    
	$(function() 
    {
	    $.chili.loadStylesheetInline('.chili-ln-off {list-style-type: none;}');
	    $.extend($.chili, $.chili.options);
        
        if ($.chili.automatic.active) 
        {
            $($.chili.automatic.selector, $.chili.automatic.context).chili();
        }
    });
