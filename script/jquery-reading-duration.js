/*jslint white: true, browser: true, devel: true,  nomen: true, todo: true */
/**
 *  jquery-biblio
 * 
 * Copyright (c) 2015 Owen Beresford, All rights reserved.
 * I have not signed a total rights contract, my employer isn't relevant.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * jquery-readingDuration ~ a simple plugin to display average reading time of articles
 *
 * @author: Owen beresford owencanprogram@fastmail.fm
 * @version: 0.1.1
 * @date: 20/11/2015
 * @licence: AGPL <http://www.gnu.org/licenses/agpl-3.0.html> 
 * 
 * deps: 
 *  jQuery must already be loaded 
 *
These are the options that are currently supported:
 ** debug ~ default: 0 ~ how much information to dump to the console
 ** linkTo ~ default: null ~ if you want a full page rather than popup, set this to your page,
 ** dataLocation ~ default: '.blocker' (to suit me) ~ what element to take as the source of the raw data
 ** target ~ default: '#shareGroup' (to suit me) ~ where to put the generated text
 ** timeFormat ~ default 'm' ~ US people like putting things in a weird order, so that may be set by the dev
 ** wordPerMin ~ default: 275 ~ the number of words that it is expected that a person can read per minute.  Change if you know the audience is abnormal (i.e. expected age is 5 or all PHDs)
 ** refresh ~ default: 0 ~ whether to delete the contents of the target first? Useful if this is a repeat call, as you changed the page content
 ** callbacks ~ defaults :
   ~ shortDisplay
   ~ longDisplay
	
*/



(function($){
	"use strict";

	/**
	 * readingDuration ~ jQuery style constructor 
	 * 
	 * @param DOMElement el
	 * @param array options ~ see doc header
	 * @access public
	 * @return <object>
	 */
	$.readingImpl = function(options) {
// msie 8
		if (window.attachEvent && !window.addEventListener) {
			if(options.debug) {
				alert("readingTime() WARNING: Ancient browser, hopefully everything still computes.\n(Dev import es5-shim to avoid this message.)");
			}
		}

		/**
		 * BibliographyExtractor
		 * 
		 * @param DOMElement el 
		 * @param array options 
		 * @return <self>
		 */
		function ReadingDuration( options) {
// http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
	        this.options = $.extend({}, $.readingImpl.defaultOptions, options);
			
			var duration= ($(this.options.dataLocation)
							.text()
							.match(/\b[^ (),;.\t\n]{3,}\b/g)
							.length)/this.options.wordPerMin * 60;
			duration += $(this.options.dataLocation).find('img').length * 12;
			// extend to pull CSS background-image 's, but that is quite slow with current jQuery
			if(this.options.codeSelector &&
				$(this.options.codeSelector).text() ) {
				duration += $(this.options.codeSelector)		
							.text()
							.match(/\b[^ (),;.\t\n]{3,}\b/g)
							.length*2 /this.options.wordPerMin * 60;
			}
	
			this.options.injectedID="id"+new Date().getTime()/1000;
			var text=this.options.callbacks.displayShort.apply(this, [duration, this.options]);
			if(this.options.refresh ) {
				var tt=$(this.options.target+" a.reading").remove();
			}	
			$(this.options.target).append(text);
			if(! this.options.linkTo) {
				text=this.options.callbacks.displayLong.apply(this, [duration, this.options]);
				if(this.options.refresh ) {
					$(this.options.injectedID).remove();
				}
				$('body').append(text);
			}
			return this;	
		}

	    return new ReadingDuration( options);
	};

// pls see doc header 
	$.readingImpl.defaultOptions = {
		debug:0,
		linkTo:null,
		timeFormat:'m', // US people like putting things in a weird order, so that may be set by the dev
		dataLocation:'.blocker',
		target:'#shareGroup',
		injectedID:'',
		wordPerMin:275, 
		codeSelector:'pre[class="source"],pre[class="code"]',
		refresh:0,
		callbacks:{
			'displayShort':f1,
			'displayLong':f2,		
				},
	};
	
	/**
	 * readingDuration ~ a simple plugin to display average reading time of articles

	 * 
	 * @param array options
	 * @access public
	 * @return void;
	 */ 
	$.fn.readingDuration= function(options) { 
		try {
			$.readingImpl(options);
		} catch( $e) { // this should only happen in dev..
			console.log($e);
		}
	};

// if you replace these, please keep the <a class="reading">
	function f1(duration, param) {
		duration=Math.round(duration/60);
		if(param.linkTo) {
			return "<a class=\"reading\" href=\""+param.linkTo+"\" title=\"See longer version of this guide.\">Reading time: "+duration+"m</a>";
		} else { 
			// ugly...
			return "<a class=\"reading\" onclick=\"$('#"+param.injectedID+"').css('display', 'block'); \" title=\"See longer version of this guide.\">Reading time: "+duration+"m</a>";
		}

	}

	function f2(duration, param) {
		duration=Math.round(duration/60);
		
		return "<div id=\""+param.injectedID+"\" class=\"reading\"> Author needs to add more text here.  </div>";
	}

}(jQuery));

