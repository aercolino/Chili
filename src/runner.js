    
	$(function() 
    {
	    $.extend( $.chili, $.chili.options, $.chili.system );
        
        if ($.chili.automatic.active) 
        {
            $($.chili.automatic.selector, $.chili.automatic.context).chili();
        }
    });
