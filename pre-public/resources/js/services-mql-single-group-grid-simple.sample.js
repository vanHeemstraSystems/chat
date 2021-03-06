Ext.require([
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.util.*',
    'Ext.state.*'
]);

Ext.onReady(function() {
    Ext.QuickTips.init();
    
    // setup the state provider, all state information will be saved to a cookie
    Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));

    // See also: http://all-docs.info/extjs4/docs/api/Ext.data.JsonReader.html

    // Create a 'Group' model.
    Ext.define('core.model.Group', {
		extend: 'Ext.data.Model',
                fields: [
			{ name: 'kp_GroupID', type: 'int'}, 
			{ name: 'GroupName', type: 'string'}
		],
		idProperty: 'kp_GroupID'
    });

	var appName = "services-mql-single-group-grid-simple";
	var ajaxCallTimeout = 30000; // 30000 is the default of ExtJS
	var ajaxCallHeaders = {
	       	//'Accept-Encoding': true,
			//'Access-Control-Allow-Origin': "*",
    		//'Access-Control-Allow-Headers' : 'Origin, X-Requested-With, Content-Type, Accept'
	    };
	//Ext.lib.Ajax.useDefaultHeader = false; // Even if a server does accept x-domain, the X-Requested-With header breaks it.
	var remoteUser = "remoteUser";

    // The JSON Reader is used by a Proxy to read a server response 
    // that is sent back in JSON format. 
    // This usually happens as a result of loading a Store
    var store = new Ext.data.Store({
	//Ext.define('core.store.Groups', {
	//	extend: 'Ext.data.Store',
	pageSize: 50, 
        model: 'core.model.Group',
		proxy: {
			type: 'ajax',
			actionMethods: {
				create: 'POST',
				write: 'POST',
				read: 'POST',
				update: 'POST',
				destroy: 'POST'
			},
			
			// A modification to get JSON data in the body of the message
			// See http://irscomp.blogspot.co.uk/2012/01/how-to-post-data-in-json-format-in.html
			doRequest: function(operation, callback, scope) {
				var writer = this.getWriter(),
					request = this.buildRequest(operation, callback, scope);
				if(operation.allowWrite()) {
					request = writer.write(request);
				}
				Ext.apply(request, {
					headers			: this.headers,
					timeout 		: this.timeout, 
					scope			: this, 
					callback		: this.createRequestCallback(request, operation, callback, scope), 
					method			: 'POST', //this.getMethod(request), 
					jsonData		: this.jsonData, 
					disableCaching  : false // explicitly set it to false, ServerProxy handles caching 
				});
				Ext.Ajax.request(request); 
				return request;
			},
			useDefaultXhrHeader : false, // set this to false to prevent a cross-domain issue
			useDefaultHeader: false,
			headers	: ajaxCallHeaders,
			timeout : ajaxCallTimeout, 
			
			contentType: "application/json; charset=utf-8",
			
			api: {
				//read: 'core/components/core/apps/core/data/mql-single-group.json',
				//read: 'http://api.vanheemstrapictures.com/services/mql/read', // use this in the future when Bluehost allows for this
				read: 'http://localhost:5001/?api=group&action=read',
				write: 'core/components/core/apps/core/data/mql-single-group.json'
			},
			reader: {
				type: 'json',
				root: 'result.result', // change from data to result.result when used with MQL
				totalProperty: 'total'
			},
			writer: {
				type: 'json',
				encode: true
			},
			simpleSortMode: true
		},
		sorters: [{
			property: 'GroupName',
			direction: 'ASC'
		}],
		listeners: {
			beforeload: function(store, operation, eOpts) {
				store.proxy.jsonData = {
					"pagination" :  {
						"page": operation.page,
						"limit": operation.limit,
						"sort": operation.sorters[0].property,
						"dir": operation.sorters[0].direction
					},
					"basicInfo" : {
						"ccoId": remoteUser,
						"prefLang": "eng_GB",
						"requestStartDate": (new Date()).toISOString(),
						"requesterApp": appName
					},
					"mql" : {
						"query" : [{
							"type": "/core/group",
							"kp_GroupID": null,
							"GroupName": null
						}]
					},
					"debug_info" : {
						
					}
				};
			}
		},
		autoLoad: true
    });

	// Sample POST output would be:
	// {
	//     "basicInfo": {
	//         "ccoId": "remoteUser", 
	//         "prefLang": "eng_GB", 
	//         "requestStartDate": "2013-02-18T20:28:22.332Z", 
	//         "requesterApp": "services-mql-single-group-grid"
	//     }, 
	//     "pagination": {
	//         "dir": "ASC", 
	//         "limit": 25, 
	//         "page": 1, 
	//         "sort": "GroupName"
	//     }
	// }

    // create the Grid
    var grid = Ext.create('Ext.grid.Panel', {
	//Ext.define('core.grid.panel', {
		//extend: 'Ext.grid.Panel',
        //store: 'core.store.Groups',
		store: store,
        stateful: true,
		//autoShow: true,
        stateId: 'stateGrid',
        columns: [
            {
                text     : 'ID',
		width	 : 24,
                sortable : true,
                dataIndex: 'kp_GroupID'
            },
            {
                text     : 'Group Name',
                flex     : 1,
                sortable : true,
                dataIndex: 'GroupName'
            }
        ],
        height: 350,
        width: 600,
        title: 'Array Grid - Group',
        renderTo: 'grid-example',
        viewConfig: {
            stripeRows: true
        }
    });
}); // end of OnReady