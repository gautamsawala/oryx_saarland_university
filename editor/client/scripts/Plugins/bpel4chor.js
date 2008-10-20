/** * Copyright (c) 2007 * Kerstin Pfitzner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/if(!ORYX.Plugins)	ORYX.Plugins = new Object();/** * Transforms a BPMNplus diagram to its XPDL4Chor representation and * calls a transformation web service to generate BPEL4Chor from the XPDL4Chor * representation. */ORYX.Plugins.Bpel4ChorTransformation = Clazz.extend({	facade: undefined,	/**	 * Offers the plugin functionality:	 * 	- generation of XPDL4Chor	 * 	- generation of BPEL4Chor	 * 	 * Registers for a ORYX.CONFIG.EVENT_PROPERTY_CHANGED event to react to changed	 * element properties.	 */	construct: function(facade) {		this.facade = facade;		this.facade.offer({			'name':ORYX.I18N.Bpel4ChorTransformation.exportBPEL,			'functionality': this.transformBPEL4Chor.bind(this),			'group': ORYX.I18N.Bpel4ChorTransformation.group,			'icon': ORYX.PATH + "images/export_multi.png",			'description': ORYX.I18N.Bpel4ChorTransformation.exportBPELDesc,			'index': 1,			'minShape': 0,			'maxShape': 0});					this.facade.offer({			'name':ORYX.I18N.Bpel4ChorTransformation.exportXPDL,			'functionality': this.transformXPDL4Chor.bind(this),			'group': ORYX.I18N.Bpel4ChorTransformation.group,			'icon': ORYX.PATH + "images/export.png",			'description': ORYX.I18N.Bpel4ChorTransformation.exportXPDLDesc,			'index': 2,			'minShape': 0,			'maxShape': 0});					this.facade.registerOnEvent(ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED, this.propertyChanged.bind(this));	},		// check if changed property does affect the transformability	/**	 * Reacts to a changed property in the property window, since this may cause	 * errors during the transformation.	 * 	 * If the name of a receiving activity was changed:	 *  - Determine all other receiving activities with an incoming message 	 *    flow to the same source activity 	 *  - If these receiving activities do not have the same name, print out	 *    a warning in a message dialog.	 *    	 * If the loop type of a receive task was changed:	 * 	- Check if the receive task is located directly after an event-based	 *    decision gateway	 *  - If so, print out a warning in a message dialog, because a looping 	 *    task is not allowed after an event-based decision gateway in BPMNplus	 * 	 * @param {Object} args 	 * 	- args.element: the changed shape	 *  - args.name:    the name of the changed property	 */	propertyChanged: function(args) {			var shape = args.element;		var stencil = shape.getStencil();		if (args.name == "oryx-name") {			if ((stencil.id() == stencil.namespace() + "ReceiveTask") || 			 (stencil.id() == stencil.namespace() + "IntermediateMessageEvent") || 			 (stencil.id() == stencil.namespace() + "StartMessageEvent")) {								// get all receiving activities with same source				var receiving = new Hash();				shape.getIncomingShapes().each(function(edge) { 					if (edge.getStencil().id() == edge.getStencil().namespace() + "MessageFlow") {						var sources = edge.getIncomingShapes();						sources.each(function(source) {							// get target of all outgoing message flows							source.getOutgoingShapes().each(function(edgeSource) {								if (edgeSource.getStencil().id() == edgeSource.getStencil().namespace() + "MessageFlow") {									var list = receiving[source.resourceId];									if (list == undefined) {										list = new Array();									}									list = list.concat(edgeSource.getOutgoingShapes());									receiving[source.resourceId] = list;								}							});						});					}				});								var name = null				var values = receiving.values();				for (var i = 0; i < values.length; i++) {					var list = values[i];					for (var j = 0; j < list.length; j++) {						var shape = list[j];						if (name == undefined) {							name = list[j].properties["oryx-name"];						} else if (name != list[j].properties["oryx-name"]) {							this.openMessageDialog(ORYX.I18N.Bpel4ChorTransformation.warning,								ORYX.I18N.Bpel4ChorTransformation.wrongValue.replace(/1/, name));							return;						}					}				}			}		} else if (args.name == "oryx-looptype") {					// if parent of receive task is event-based decision gateway			// the loop type should be None to be transformable to BPEL4Chor			if (stencil.id() == stencil.namespace() + "ReceiveTask") {				// get incoming sequence flows				shape.getIncomingShapes().each(function(edge) { 					if (edge.getStencil().id() == edge.getStencil().namespace() + "SequenceFlow") {						// get source of sequence flows						var sources = edge.getIncomingShapes();						sources.each(function(source) {							if (source.getStencil().id() == stencil.namespace() + "Exclusive_Eventbased_Gateway") {								if (shape.properties["oryx-looptype"] != "None") {									this.openMessageDialog(ORYX.I18N.Bpel4ChorTransformation.warning, ORYX.I18N.Bpel4ChorTransformation.loopNone);									 return;								}							}						});					}				});			}		}	},		/**	 * Checks if all edges have a source and a target element. 	 * If not print out an error in a message dialog.	 * 	 * The check is necessary because such edges would lead to a parser	 * error during the transformation.	 */	validate: function() {		// check if all edges have a source and a target		var edges = this.facade.getCanvas().getChildEdges();		for (var i = 0; i < edges.size(); i++) {			var edge = edges[i];			var name = edge.getStencil().title();			var id = edge.properties["oryx-id"];			if (edge.getIncomingShapes().size() == 0) {				this.openMessageDialog(ORYX.I18N.Bpel4ChorTransformation.error, ORYX.I18N.Bpel4ChorTransformation.noSource.replace(/1/, name).replace(/2/, id));				return false;			} else if (edge.getOutgoingShapes().size() == 0) {				this.openMessageDialog(					ORYX.I18N.Bpel4ChorTransformation.error, ORYX.I18N.Bpel4ChorTransformation.noTarget.replace(/1/, name).replace(/2/, id));				return false;			}			}		return true;	},		/**	 * Since canvas properties are not serialized they can not be	 * transformed using xslt. Thus, they will be added after the	 * xslt transformation using this method.	 * 	 * @param {Object} xpdl4chor The generated xpdl4chor document	 */	addCanvasProperties: function(xpdl4chor) {		// chor:TargetNamespace		var canvas = this.facade.getCanvas();		var targetNamespace = xpdl4chor.createAttribute("chor:TargetNamespace");		targetNamespace.value = canvas.properties["oryx-targetNamespace"];		xpdl4chor.documentElement.setAttributeNode(targetNamespace);				// Name		var name = xpdl4chor.createAttribute("Name");		name.value = canvas.properties["oryx-name"];		xpdl4chor.documentElement.setAttributeNode(name);				// Id		var idAttr = xpdl4chor.createAttribute("Id");		var id = canvas.properties["oryx-id"];		if (id == "") {			id = DataManager.__provideId();		}		idAttr.value = id;		xpdl4chor.documentElement.setAttributeNode(idAttr);				// PackageHeader.Created		var created = xpdl4chor.createElement("xpdl:Created");		var createdText = document.createTextNode(canvas.properties["oryx-creationdate"]);		created.appendChild(createdText);		var parent = xpdl4chor.documentElement.firstChild;		parent.appendChild(created);				// RedefinableHeader		var expressionLanguage = canvas.properties["oryx-expressionlanguage"];		var queryLanguage = canvas.properties["oryx-querylanguage"];				var header = xpdl4chor.createElement("xpdl:RedefinableHeader");		if (queryLanguage != "") {			var queryLangAttr = xpdl4chor.createAttribute("chor:QueryLanguage");			queryLangAttr.value = queryLanguage;			header.setAttributeNode(queryLangAttr);		}		if (expressionLanguage != "") {			var expressionLangAttr = xpdl4chor.createAttribute("chor:ExpressionLanguage");			expressionLangAttr.value = expressionLanguage;			header.setAttributeNode(expressionLangAttr);		}		// append header after first child (PackageHeader node)		xpdl4chor.documentElement.insertBefore(header, xpdl4chor.documentElement.firstChild.nextSibling);	},		/**	 * Analyzes the result of the web service call.	 * 	 * If an fault occured or the answer is undefined, the error is shown	 * using a message dialog.	 * 	 * If the answer starts with "ParserError" the error is shown using an 	 * error dialog. Otherwise the result is shown using the result dialog.	 * 	 * @param {Object} answer answer of the web service	 * @param {Object} call   the soap call	 * @param {Object} status the status of the call	 */	result: function(answer, call, status) {				   if (answer.fault) {	     	this.openMessageDialog(ORYX.I18N.Bpel4ChorTransformation.error, ORYX.I18N.Bpel4ChorTransformation.transCall.replace(/1/, answer.fault.faultCode).replace(/2/, answer.fault.faultString));	   } else {	  	   		if (answer.body == undefined) {				// no result returned				this.openMessageDialog(ORYX.I18N.Bpel4ChorTransformation.error,ORYX.I18N.Bpel4ChorTransformation.noResult) ;			} else if (answer.body.textContent.indexOf("Parser Error") >= 0) {				// Parser error				this.openErrorDialog(answer.body.textContent);			} else {						var result = answer.body.firstChild;				if (result.childNodes.length > 0) {					var topology = result.childNodes[0].textContent;					var processes = new Array();					for (var i = 1; i < result.childNodes.length; i++) {						processes[i-1] = result.childNodes[i].textContent;					}				}				var data = this.buildTransData(topology, processes);				this.openResultDialog(data);			}				   }	   this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});	},		/**	 * Opens a message dialog with the given title that shows	 * the content. The dialog just shows a message and has a 	 * "OK" button to be closed.	 * 	 * @param {String} title   The title of the dialog	 * @param {String} content The content to be shown in the dialog	 */	openMessageDialog: function(title, content) {				var dialog = new Ext.Window({ 			autoCreate: true, 			title: title, 			modal:true,			height: 120,			width: 400,			collapsible:false,			fixedcenter: true, 			shadow:true, 			resizable:true,			proxyDrag: true,			autoScroll:true,			buttonAlign:"center",            bodyStyle:'padding:10px',            html:'<span class="ext-mb-text">' + content + '</span>'                        		});		//dialog.addKeyListener(27, dialog.hide, dialog);		dialog.addButton('OK', dialog.hide, dialog);		dialog.on('hide', function(){			dialog.destroy(true);			delete dialog;		});				dialog.show();	},		/**	 * Opens an error dialog that shows the given content.	 * The error is shown in a text area.	 * 	 * @param {String} content The error to be shown	 */	openErrorDialog: function(content) {		// Basic Dialog		var text = new Ext.form.TextArea({			id:'error-field',			fieldLabel: ORYX.I18N.Bpel4ChorTransformation.error,			name: 'desc',			height: 405,			width: 633,			preventScrollbars: true,			value: content,			readOnly:true        });				var dialog = new Ext.Window({ 			autoCreate: true, 			title: ORYX.I18N.Bpel4ChorTransformation.errorParsing, 			modal:true,			height: 450,			width: 650,			collapsible:false,			fixedcenter: true, 			shadow:true, 			resizable:false,			proxyDrag: true,			autoScroll:false		});		//dialog.addKeyListener(27, dialog.hide, dialog);		dialog.on('hide', function(){			dialog.destroy(true);			text.destroy(true);			delete dialog;			delete text;		});		text.render(dialog.body);				dialog.show();	},		/**	 * Determines if the result is an XML file or not.	 * For this purpose it is determined if the given	 * result starts with "<?xml".	 * 	 * @param {Object} result The result to be checked.	 * @return "success" if it is an XML file, "error" otherwise	 */	getResultInfo: function(result) {		if (!result) {			return "error";		} else if (result.substr(0, 5) == "<?xml") {			return "success";		}				return "error";	},	/**	 * Determines the process name for a given process	 * string. 	 * 	 * @param {String} process The BPEL4Chor process.	 */	getProcessName: function(process) {		var parser	= new DOMParser();		var doc		= parser.parseFromString(process,"text/xml");		var name 	= doc.documentElement.getAttribute("name");		return name;	},		/**	 * Builds up the data that will be shown in the result dialog of	 * the BPEL4Chor transformation.	 * For this purpose the process names are determined and	 * it is checked if the topology and process were generated	 * successfully.	 * 	 * @param {String} topology    The generated topology 	 * @param {String[]} processes The generated processes	 */	buildTransData: function(topology, processes) {		var data = [		    ["topology", topology, this.getResultInfo(topology)]		];				for (var i = 0; i < processes.length; i++) {			var name = this.getProcessName(processes[i]);			if (name == undefined) {				name = "Process " + (i+1);			}			data[i+1] = [name, processes[i], this.getResultInfo(processes[i])];		}					return data;	},		/**	 * Builds up the data that will be shown in the result dialog of	 * the XPDL4Chor transformation.	 * 	 * @param {String} xpdl4chor The generated XPDL4Chor.	 */	buildXPDL4ChorData: function(xpdl4chor) {		var data = [		    ["XPDL4Chor", xpdl4chor, this.getResultInfo(xpdl4chor)]		];				return data;	},		/**	 * Opens a dialog that presents the results of a transformation.	 * The dialog shows a list containing the resulting XML files.	 * Each file can be shown in a new window or downloaded.     *	 * @param {Object} data The data to be shown in the dialgo	 */	openResultDialog: function(data) {				var ds = new Ext.data.Store({	        proxy: new Ext.data.MemoryProxy(data),	        reader: new Ext.data.ArrayReader({}, [	               {name: 'file', type: 'string'},	               {name: 'result', type: 'string'},	               {name: 'info', type: 'string'}	        	])		});				ds.load();		// renderer		var infoRenderer = function (val){            if(val == "success"){                return '<span style="color:green;">' + val + '</span>';            }else if(val == "error"){                return '<span style="color:red;">' + val + '</span>';            }            return val;        };			var cm = new Ext.grid.ColumnModel([		    {id:'file',header: "File", width: 200, sortable: false, dataIndex: 'file', resizable: false},		    {header: "Info", width: 75, sortable: false, dataIndex: 'info', renderer: infoRenderer, resizable: false} 		]);						var grid = new Ext.grid.GridPanel({			store:ds,	        cm: cm,	        sm: new Ext.grid.RowSelectionModel({ 	singleSelect:true }),			autoWidth: true	    });			    var toolbar = new Ext.Toolbar();				var dialog = new Ext.Window({ 			autoCreate: true, 			title: ORYX.I18N.Bpel4ChorTransformation.transResult, 			autoHeight: true, 			width: 297, 			modal:true,			collapsible:false,			fixedcenter: true, 			shadow:true, 			proxyDrag: true,			resizable:false,			items:[toolbar, grid]		});			dialog.on('hide', function(){			dialog.destroy(true);			grid.destroy(true);			delete dialog;			delete grid;		});		dialog.show();				toolbar.add({			icon: 'images/view.png', // icons can also be specified inline	        cls: 'x-btn-icon',    	    tooltip: ORYX.I18N.Bpel4ChorTransformation.showFile,			handler: function() {				var ds = grid.getStore();				var selection = grid.getSelectionModel().getSelected();				if (selection == undefined) {					return;				}				var show = selection.get("result");				if (selection.get("info") == "success") {					this.openXMLWindow(show);				} else {					this.openErrorWindow(show);				}			}.bind(this)		});		toolbar.add({			icon: 'images/disk.png', // icons can also be specified inline	        cls: 'x-btn-icon',    	    tooltip: ORYX.I18N.Bpel4ChorTransformation.downloadFile,			handler: function() {				var ds = grid.getStore();				var selection = grid.getSelectionModel().getSelected();				if (selection == undefined) {					return;				}				this.openDownloadWindow(selection, false);			}.bind(this)		});		toolbar.add({			icon: 'images/disk_multi.png', // icons can also be specified inline	        cls: 'x-btn-icon',    	    tooltip: ORYX.I18N.Bpel4ChorTransformation.downloadAll,			handler: function() {				var ds = grid.getStore();								this.openDownloadWindow(ds.getRange(0, ds.getCount()), true);			}.bind(this)		});							// Select the first row		grid.getSelectionModel().selectFirstRow();	},		/**	 * Opens a new window that shows the given XML content.	 * 	 * @param {Object} content The XML content to be shown.	 */	openXMLWindow: function(content) {		var win = window.open(		   'data:application/xml,' + encodeURIComponent([		     content		   ].join('\r\n')),		   '_blank', "resizable=yes,width=600,height=600,toolbar=0,scrollbars=yes"		);	},		/**	 * Opens a window that shows the given text content.	 * 	 * @param {Object} content The text content to be shown.	 */	openErrorWindow: function(content) {		var win = window.open(		   'data:text/html,' + encodeURIComponent([		     "<html><body><pre>" + content + "</pre></body></html>"		   ].join('\r\n')),		   '_blank', "resizable=yes,width=800,height=300,toolbar=0,scrollbars=yes"		);	},		/**	 * Creates a hidden form element to communicate parameter values	 * to a php file.	 * 	 * @param {Object} name  The name of the hidden field	 * @param {Object} value The value of the hidden field	 */	createHiddenElement: function(name, value) {		var newElement = document.createElement("input");		newElement.name=name;		newElement.type="hidden";		newElement.value = value;		return newElement	},		/**	 * Adds a file extension to the given file name. If the file	 * has the name "topology" or "XPDL4Chor" an .xml extension will	 * be added. Otherwise a .bpel extension will be added	 * 	 * @param {Object} file The file name to add the extension to.	 */	addFileExtension: function(file) {		if ((file == "topology") || (file == "XPDL4Chor")) {			return file + ".xml";		} else {			return file + ".bpel";		}	},		/**	 * Opens a download window for downloading the given content.	 * 	 * Creates a submit form to communicate the contents to the 	 * download.php file.	 * 	 * @param {Object} content The content to be downloaded. If it is a zip 	 *                         file, then this should be an array of contents.	 * @param {Object} zip     True, if it is a zip file, false otherwise	 */	openDownloadWindow: function(content, zip) {		var win = window.open("");		if (win != null) {			win.document.open();			win.document.write("<html><body>");			var submitForm = win.document.createElement("form");			win.document.body.appendChild(submitForm);						if (zip) {				for (var i = 0; i < content.length; i++) {					var file = this.addFileExtension(content[i].get("file"));					submitForm.appendChild( this.createHiddenElement("download_" + i, content[i].get("result")));					submitForm.appendChild( this.createHiddenElement("file_" + i, file));				}			} else {				var file = this.addFileExtension(content.get("file"));				submitForm.appendChild( this.createHiddenElement("download", content.get("result")));				submitForm.appendChild( this.createHiddenElement("file", file));			}						submitForm.method = "POST";			win.document.write("</body></html>");			win.document.close();			submitForm.action= "download.php";			submitForm.submit();		}			},		/**	 * Calls the web service to transform the given XPDL4Chor to BPEL4Chor.	 * When the call has finished the result() method will be called.	 * 	 * @param {Object} xpdl4chor	 */	callWebService: function(xpdl4chor) {							new Ajax.Request("/oryx/bpel", {				method: 'POST',				asynchronous: true,				parameters: {					data: xpdl4chor				},				onSuccess: function(request){						var win = window.open('data:text/xml,' +request.responseText, '_blank', "resizable=yes,width=640,height=480,toolbar=0,scrollbars=yes");				}			});		/** OLD REQUEST			// TODO: sign editor to call web service that is not on the same server		var call = new SOAPCall();		call.transportURI = ORYX.CONFIG.TRANS_URI;		call.actionURI = "";				var inputDiagram = new SOAPParameter();		inputDiagram.name = "diagramStr";		inputDiagram.value = xpdl4chor;				var inputValidate = new SOAPParameter();		inputValidate.name= "validate";		inputValidate.value = false;				call.encode(		   0,		   "transform",		   ORYX.CONFIG.TRANS_SERVER,		   0,		   null,		   2,		   new Array(inputDiagram, inputValidate)		);										try {			call.asyncInvoke(this.result.bind(this));		} catch (error) {			this.openMessageDialog("Error","An error occured: " + error.name + "\n" +					error.message + "\n");		}				**/	},		/**	 * Transforms the model to XPDL4Chor using the xslt stylesheet.	 * After that the web service for the transformation to BPEL4Chor	 * will be called.	 * 	 * @param {Object} xpdlOnly True, if only the XPDL4Chor should be 	 *                          generated, false otherwise	 */	transform: function(xpdlOnly) {				this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_ENABLE, text:ORYX.I18N.Bpel4ChorTransformation.loadingExport});				var valid = this.validate();	   	if (!valid) {			this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});			return null;		}				var xsltProcessor = new XSLTProcessor();				var xslRef = document.implementation.createDocument("", "", null);		var index = location.href.lastIndexOf("/");		var xslt = location.href.substring(0, index) + "/xslt/BPMNplus2XPDL4Chor.xsl";		xslRef.load(xslt);						xslRef.onload = function() {			// import the .xsl and do transformation			xsltProcessor.importStylesheet(xslRef);					var serializedDOM = DataManager.serializeDOM(this.facade);							// single parent node needed to parse the DOM			serializedDOM = "<data>" + serializedDOM + "</data>";		  					var parser=new DOMParser();			var doc=parser.parseFromString(serializedDOM,"text/xml");						try {				var xpdl4chor = xsltProcessor.transformToDocument(doc);			} catch (error) {				this.openMessageDialog(ORYX.I18N.Bpel4ChorTransformation.error, ORYX.I18N.Bpel4ChorTransformation.noGen.replace(/1/, error.name).replace(/2/, error.message));				this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});				return null;			}						this.addCanvasProperties(xpdl4chor);						var serialized = (new XMLSerializer()).serializeToString(xpdl4chor);			serialized = serialized.startsWith("<?xml") ? serialized : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + serialized;						if (xpdlOnly) {				this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});								var data = this.buildXPDL4ChorData(serialized);				this.openResultDialog(data);			} else {				this.callWebService(serialized);			}		}.bind(this);	},		/**	 * Transform the model to its XPDL4Chor representation.	 */	transformXPDL4Chor: function() { 				this.transform(true);	},  	/**  	 * Transform the model to its BPELChor representation.  	 */	transformBPEL4Chor: function(){ 	   		this.transform(false);			}});