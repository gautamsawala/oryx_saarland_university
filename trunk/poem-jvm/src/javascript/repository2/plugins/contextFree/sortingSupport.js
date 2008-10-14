/**
 * Copyright (c) 2008
 * Willi Tscheschner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/

// define namespace
if(!Repository) var Repository = {};
if(!Repository.Plugins) Repository.Plugins = {};

/**
 * Supplies filtering by model type (stencil set)
 * Note: Only stencil sets defined in the stencilsets.json can be selected as filter
 */

Repository.Plugins.SortingSupport = {
	
	construct: function( facade ) {
		
		// define Create New Model menu
		this.toolbarButtons = [];
		this.facade 		= facade;
		
		
		this.facade.modelCache.getAvailableSorts().each(function(type) {
			
			this.toolbarButtons.push({
				text 		: Repository.I18N.SortingSupport[type],
				menu 		: Repository.I18N.SortingSupport.name,
				menuIcon 	: "/backend/images/silk/table_sort.png",
				tooltipText : Repository.I18N.SortingSupport.name,
				//icon 		: type,
				handler		: this._setSorting.bind(this, type)				
			});
		}.bind(this));
					
		arguments.callee.$.construct.apply(this, arguments); //call Plugin super class
		

	},
	
	_setSorting: function( type ){
		
	}
};

Repository.Plugins.SortingSupport = Repository.Core.ContextPlugin.extend(Repository.Plugins.SortingSupport);
