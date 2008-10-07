/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/if(!ORYX.Plugins)	ORYX.Plugins = new Object();ORYX.Plugins.AddDocker = Clazz.extend({	/**	 *	Constructor	 *	@param {Object} Facade: The Facade of the Editor	 */	construct: function(facade) {		this.facade = facade;		this.facade.offer({			'name':ORYX.I18N.AddDocker.add,			'functionality': this.enableAddDocker.bind(this),			'group': ORYX.I18N.AddDocker.group,			'icon': ORYX.PATH + "images/vector_add.png",			'description': ORYX.I18N.AddDocker.addDesc,			'index': 1,			'minShape': 0,			'maxShape': 0});		this.facade.offer({			'name':ORYX.I18N.AddDocker.del,			'functionality': this.enableDeleteDocker.bind(this),			'group': ORYX.I18N.AddDocker.group,			'icon': ORYX.PATH + "images/vector_delete.png",			'description': ORYX.I18N.AddDocker.delDesc,			'index': 2,			'minShape': 0,			'maxShape': 0});				this.facade.registerOnEvent('mousedown', this.handleMouseDown.bind(this));				this.enabledAdd 	= false;		this.enabledDelete 	= false;				},		enableAddDocker: function() {		this.enabledAdd 	= true;		this.enabledDelete 	= false;			},	enableDeleteDocker: function() {		this.enabledDelete 	= true;		this.enabledAdd 	= false;			},		/**	 * MouseDown Handler	 *	 */		handleMouseDown: function(event, uiObj) {		var edge, docker, pos;				if (this.enabledAdd && uiObj instanceof ORYX.Core.Edge) {			pos = this.facade.eventCoordinates(event);			edge = uiObj;		} else if (this.enabledDelete &&				   uiObj instanceof ORYX.Core.Controls.Docker &&				   uiObj.parent instanceof ORYX.Core.Edge) {			docker = uiObj;			edge = uiObj.parent;		}				if (edge) {			var commandClass = ORYX.Core.Command.extend({				construct: function(addEnabled, deleteEnabled, edge, docker, pos, facade){					this.addEnabled = addEnabled;					this.deleteEnabled = deleteEnabled;					this.edge = edge;					this.docker = docker;					this.pos = pos;					this.facade = facade;				},				execute: function(){					if (this.addEnabled) {							this.docker = this.edge.addDocker(this.pos, this.docker);					}					else if (this.deleteEnabled) {						this.pos = docker.bounds.center();						this.edge.removeDocker(this.docker);					}										this.facade.updateSelection();				},				rollback: function(){					if (this.addEnabled) {						if (this.docker instanceof ORYX.Core.Controls.Docker) {							this.edge.removeDocker(this.docker);						}					}					else if (this.deleteEnabled) {						this.docker = this.edge.addDocker(this.pos, this.docker);					}										this.facade.updateSelection();				}			})						var command = new commandClass(this.enabledAdd, this.enabledDelete, edge, docker, pos, this.facade);						this.facade.executeCommands([command]);						this.enabledAdd = false;			this.enabledDelete = false;		}	}});