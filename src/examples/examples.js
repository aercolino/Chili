/*
===============================================================================
Chili is the jQuery code highlighter plugin
...............................................................................
LICENSE: http://www.opensource.org/licenses/mit-license.php
WEBSITE: http://noteslog.com/chili/

                                               Copyright 2008 / Andrea Ercolino
===============================================================================
*/

/* this is just some jQuery magic for your viewing pleasure */

$( function() {
//---------------------------------------------------collapsible sections start
	$( 'pre' ).hide();
	$( '.section h3' ).css( { cursor: 'pointer' } ).bind( 'click', function() {
		$( this ).parent().find( 'pre' ).toggle();
	} );
//---------------------------------------------------collapsible sections end--

//-------------------------------------------------------setup reflection start
	var script_text = $.browser.msie 
		? document.scripts['setup'] && document.scripts['setup'].text
		: $( '#setup' ).text()
	;
	if( !script_text ) script_text = '';
	$( '#show_setup' ).html( ''
		+'<h4>jQuery version is ' + $.fn.jquery + ' (latest)</h4>'
		+'<pre><code class="javascript">'
			+script_text
			.replace( '&', '&amp;' )
			.replace( '<', '&lt;' )
			.replace( '>', '&gt;' )
		+'</code></pre>'
	);
	$( '#show_setup > pre > code' ).chili();
//-------------------------------------------------------setup reflection end--

	$( '#title' ).text( document.title );
} );
