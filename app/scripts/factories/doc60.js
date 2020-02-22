'use strict';
/**
 * doc60 factory added to $scope
 * added on 2016-02-12 - James Mendham
 * 
 * @name doc60 Factory
 * @description This method returns all objects associated with doc60 and way bill pdf objects for pdfMake
 * METHODS
 * DOC60 SECTIONS
 */

angular.module('clientApp').factory('doc60', function ($q, $rootScope, $location, $window, $compile, moment, utils , mathService) {
    
    var defaultMargin = [ 0, 0, 0, 20 ];

    return {
		
        /**
         * Return doc60 keg table
         *
         * @param  object  object
         * @return string  table 
         */
        parseInvoiceKegTable: function(object){
            var self = this;
            
            var table = {
                style: 'tableExample',
                widths: [ 
                    'auto', 
                    'auto', 
                    'auto', 
                    'auto' 
                ],
                table: { 
                    body: [ 
                        self.docText(
                            [ 
                                'Size', 
                                'Quantity', 
                                'Item Deposit',
                                'Unit Deposit', 
                                'Total Deposit' 
                            ],[ 
                                'subHeader' 
                            ]
                        )
                    ]
                }
            };
            
            object.map(function( item ){
                
                console.log( '|----------------------------------------|' );
                console.log( 'PARSE-INVOICE-TABLE.OBJECT.ITEM >> ', item );
                
                var litter_rate = Number(parseFloat(item.litter_rate)),
                    bpc = Number(parseInt(item.bottles_per_case)),
                    bps = Number(parseInt(item.bottles_per_sku)),
                    quantity = Number(parseInt(item.quantity));

                var calcDeposit = Number(((litter_rate * bpc) / bps)),
                    totalDeposit = Number(parseFloat(calcDeposit) * quantity);
                
                table.table.body.push(
                    self.docText(
                        [
                            parseFloat(item.litres_per_bottle).toFixed(2) + ' L', 
                            quantity.toFixed(0), 
                            '$ ' + parseFloat(litter_rate).toFixed(2),
                            '$ ' + parseFloat(calcDeposit).toFixed(2), 
                            '$ ' + parseFloat(totalDeposit).toFixed(2)
                        ],[ 
                            'tableText' 
                        ]
                    )
                );
            });
            
            return table;
            
        },
		
        /**
         * Return doc60 Invoice Header
         *
         * @param  object  object
         * @return object  table 
         */
        invoiceHeader: function( row ){
			
			var self = this, 
				customer = row.customer_info[0],
				manufacturer = row.manufacturer_info[0], 
				notes = row.notes.value,
				thisNote = '', 
				cAddress = customer.address,
				mAddress = manufacturer.address;
            
            for(var key in mAddress){
                var type = utils.toType(mAddress[key]);
                if(type === 'null' || type === 'undefined'){
                    mAddress[key] = ' ';
                    console.log(' Ok, so this hit; Not cool bro, not cool >> ', key, mAddress[key]);
                }
            }
			
			var manufacturerAddress = mAddress.street.value;
			manufacturerAddress += ', ' + mAddress.city.value;
			manufacturerAddress += '\n' + mAddress.state.value;
			manufacturerAddress += ' ' + mAddress.zipcode;
			
			var customerAddress = cAddress.street.value;
            customerAddress += ', ' + cAddress.city.value;
			customerAddress += '\n' + cAddress.state.value;
			customerAddress += ' ' + cAddress.zipcode;
			
			var arrTypes = [3,19,21,22];
			
			if( notes.length > 0 ){
				for( var i = 0; i < notes.length; i++ ){
					
					console.log( '|---------------------------------------|' );
					console.log( 'NOTE-TYPE.EXISTS >> ', utils.hayStack(arrTypes, notes[i].type_id) );
					
					utils.hayStack(arrTypes, notes[i].type_id) === true ?
						thisNote += notes[i].details + '\n' : thisNote += '';
					
					(notes[i].type.id === 19 || notes[i].type.id === 3) ? 
						thisNote += notes[i].details + '\n' : 
						thisNote += '';
					
				}
			}
			
			
			var invoice = [
				// HEADER
				{
					margin: defaultMargin,
					columns: [
						// ROW ONE
						[],
						// ROW TWO
						[
							self.docText('LiQUOR DISTRIBUTION BRANCH', [
								'label',
								'textCenter'
							]),
							self.docText( 'LICENSEE - AGENCY ORDER FORM', [
								'label',
								'textCenter',
								'bold'
							])
						],
						// ROW THREE
						[]
					]
				},
				// MANUFACTURER
				{
					margin: defaultMargin,
					columns: [
						// ROW ONE
						self.docStoreTypes(customer.type),
						// ROW TWO
						[
							self.docSignatureBox([
								self.objectBox(
									manufacturer.value, 
									'manufacturer'
								)], self.docText(
								manufacturerAddress, [ 
									'textCenter', 
									'', 
									'label'
								]
							)),
						],
						// ROW THREE
                        [
                            self.docText(
                                'CONFIDENTIAL',
                                [ 
                                    'textRight', 
                                    'red', 
                                    'bold' 
                                ]
                            ),
                            self.docInput( 
                                'DOC-60: ', 
                                '', 
                                'textRight', 
                                row.order_reference.value
                            ),
                            self.docInput( 
                                'STORE: ', 
                                '', 
                                'textRight', 
                                ''
                                // row.manufacturer_info[0].store_number
                            ),
                            self.docInput( 
                                'DATE: ', 
                                '', 
                                'textRight', 
                                moment(row.created_date.value).format("MMM Do YYYY"))
                        ]
					]
				},
				// CUSTOMER
				{
                    margin: defaultMargin,
                    columns: [ 
                        [ 
                            self.docInput(
                                'CUSTOMER NUMBER: ', 
                                '', 
                                '', 
                                customer.license.number
                            ) 
                        ],[ 
                            self.docSignatureBox([ 
								self.objectBox( 
									customer.value, 
									'customer' 
								)], self.docText( 
								customerAddress, [ 
									'textCenter', 
									'', 
									'label' 
								]
							)),
                        ],[
                            self.docInput( 
                                'NOTES: ', 
                                '', 
                                '', 
                                thisNote
                            )
                        ]
                    ] 
				}
			];
			
			return invoice;

        },
		
        /**
         * Return doc60 order items table
         *
         * @param  object  object
         * @return object  table 
         */
        invoiceTable: function( row ){
            var self = this, 
                orders = row .products.value,
				TotalDeposit = 0;
			
			// CALCULATION
            orders.map(function( item ){
                
                console.log( '|----------------------------------------|' );
                console.log( 'PARSE-TABLES.ORDERS.ITEM >> ', item );
                
                var litter_rate = Number(parseFloat(item.litter_rate)),
                    bpc = Number(parseInt(item.bottles_per_case)),
                    bps = Number(parseInt(item.bottles_per_sku)),
                    quantity = Number(parseInt(item.quantity));

                var calcDeposit = Number(((litter_rate * bpc) / bps));
				
                TotalDeposit += Number(parseFloat(calcDeposit) * quantity);
            });
			
			var subTotal = parseFloat(mathService.sumTransaction(orders, 'subTotal')).toFixed(2),
				totalTax = parseFloat(mathService.sumTransaction(orders, 'totalTax')).toFixed(2),
				Total = parseFloat(mathService.calcTotal([ subTotal, totalTax, TotalDeposit ])).toFixed(2);
			
			row.promo.value === true ? Total = parseFloat('0.00').toFixed(2) : null;
			
			var CalculatedTotals = { 
				margin: defaultMargin, 
				columns : [ 
					[ 
						self.parseInvoiceKegTable(orders) 
					],[
						self.docInput( 
							'Sub-Total', 
							'textRight', 
							'textRight', 
							'$ ' + parseFloat(subTotal).toFixed(2)
						),
						self.docInput(
							'GST', 
							'textRight', 
							'textRight', 
							'$ ' + parseFloat(totalTax).toFixed(2)
						),
						self.docInput( 
							'Container Deposit', 
							'textRight', 
							'textRight', 
							'$ ' + parseFloat(TotalDeposit).toFixed(2)
						),
						self.docInput( 
							'Amount Due', 
							'textRight', 
							'textRight', 
							'$ ' + parseFloat(Total).toFixed(2)
						)
					]
				]
			};
			
			var container = [
				{
					style: [ 'marginBottom', 'table' ],
					color: '#444',
					table: {
						widths: [ '10%' , 'auto', '55%' , 'auto' , 'auto' , 'auto' , 'auto' ],
						headerRows: 2,
						body: [
							[
								{
									border: [ false, false, false, true ],
									text: 'Ordered',
									style: 'tableHeader',
									colSpan: 3,
									alignment: 'center'
								},
								{},
								{},
								{
									border: [ false, false, false, true ],
									text: 'Supplied',
									style: 'tableHeader',
									colSpan: 4,
									allignment: 'center'
								},
								{},
								{},
								{}
							],
							self.docText(
								[ 
									'Size', 
									'Order Qty', 
									'Brand Name', 
									'SKU', 
									'Qty in Units', 
									'Unit Selling Price', 
									'Value' 
								], [ 
									'subHeader' 
								]
							)
						]
					}
				},
				CalculatedTotals
			];
			
			for(var i = 0; i < orders.length; i++ ){
                
                var qty = parseInt(orders[i].quantity),
                    bpc = parseInt(orders[i].bottles_per_case),
                    bps = parseInt(orders[i].bottles_per_sku),
                    unitQty = parseInt( (bpc / bps) * parseInt(orders[i].quantity) ),
                    price = parseFloat(orders[i].price),
					calcTotal = parseFloat(unitQty * price);
				
				var thisRow = self.docText(
					[ 
						parseFloat(orders[i].litres_per_bottle).toFixed(2) + ' L',
						qty.toString(),
						utils.stringCapitalise(orders[i].product.toLowerCase()),
						orders[i].sku.toString(),
						unitQty.toString(),
						parseFloat(orders[i].price).toFixed(2),
						parseFloat(calcTotal).toFixed(2)
					], [ 
						'tableText', 
						'textCenter' 
					]
				);
				
				container[0].table.body.push(thisRow);
			}
                      
            return container;
        },
		
        /**
         * Return doc60 invoice signtatures section
         *
         * @return object  invoiceSignatures 
         */
        invoiceSignatures: function () {
            var self = this;
                        
            return  {
                margin: [ 0, 20, 0, 20 ],
                columns: [
                    [
                        self.docSignatureBox( null, 'PREPARED BY' ),
                        self.docSignatureBox( null, 'AUTHORIZED OFFICER OF LICENSEE OR AGENCY' ),
                    ],[
                        // Changed the columns for the signature and the name
                        self.docSignatureBox( null, 'SIGNATURE OF DRIVER' ),
                        self.docSignatureBox( null, 'SIGNATURE OF AUTHORIZED OFFICER (LICENSEE/AGENCY)' ),
                    ]
                ]
            };
        },
		
		// PDF FOOTER OBJECT
		invoiceFooter: function( row ){
			
			var self = this,
				ref = 'DT#: ' + row.order_id.value;
			
			console.log( 'INVOICE-FOOTER.ROW >> ', row );
			
			var footer = self.docText(
				[
					ref.toString() ,
					'','',''
				],[
					'docFooter'
				]
			);
			
			return footer;
			
		},
		
        /**
         * Return wayBill table
         *
         * @param  object  object
         * @return object  table 
         */
        parseBolOrderTable: function( object ){
            var self = this, 
                // deferred = $q.defer(), 
                table, 
                tableHeader = [];
            
            tableHeader = self.docText(
                [ 
                    'QUANTITY',
                    'DESCRIPTION OF ARTCILES, SPECIAL MARKS AND EXCEPTIONS',
                    'SKU',
                    'VOLUME' 
                ],[ 
                    'tableHeader' 
                ]
            );
            
            table = { 
                headerRows: 1,
                // keepWithHeaderRows: 1,
                // dontBreakRows: true,
                widths: [ 
                    '10%', 
                    'auto', 
                    '10%', 
                    '10%'
                ],
                style: 'table',
                body: [ 
                    tableHeader 
                ]
            };
                        
            //Build Order Table
            object.products.value.map( function( item ){
                
                console.log( '|-------------------------|' ); 
                console.log( 'ITEM >> ', item );

                table.body.push( 
                    self.docText( 
                        [ 
                            parseInt(item.quantity).toFixed(0), 
                            utils.stringCapitalise(item.product), 
                            utils.toType(item.sku) !== 'undefined' ? item.sku.toString() : null, 
                            parseFloat(item.litres_per_bottle).toFixed(2) 
                        ],[ 
                            'label', 
                            'bold', 
                            'textCenter' 
                        ]
                    )
                );
                
            });
                                    
            return table;
        },
		
        /**
         * Return wayBill Header
         *
         * @param  object  object
         * @return object  table 
         */
        bolDocHeader: function(object){
			
			
			console.log( 'BOL-DOC-HEADER.ROOTSCOPE >> ', $rootScope );
			console.log('BOL-DOC-HEADER.object >> ', object );
			
            var self = this,
            header = {
                margin  :   [ 0, 0, 0, 20 ],
                columns : []
            };
			
			// BUILD LOGO
            var logo = null;
			
            utils.toType($rootScope.profile.company_logo) === 'undefined' ?
                $rootScope.profile.company_logo = self.drawImage(angular.element('#navlogo').get(0).src) : 
                $rootScope.profile.company_logo = self.drawImage($rootScope.profile.company_logo);
            
			// POST BASE64 LOGO TO $rootScope.profile
            console.log( 'LOGO >> ', $rootScope.profile.company_logo );
			
			logo = $rootScope.profile.company_logo;
            
			header.columns = [
				/*
				[
					self.docImage(
						$rootScope.profile.company_logo,{ width:50,height:50 }
					)
				],[
				*/	
				[
					self.docImage( self.drawImage(angular.element('#navlogo').get(0).src), {width: 50, height: 50})
				],[
					self.docText('BILL OF LADING', [
						'bold',
						'textRight',
						'marginBottom'
					]),
					self.docText('TRANSFER ID: ' + object.id, [
						'bold',
						'textRight',
						'marginBottom'
					]),
					self.docText('DATE: ' + moment(object.deliver_date.value).format("MMM Do YYYY"), [
						'bold',
						'textRight',
						'marginBottom'
					])
				]
			];
            
            return header;
        },

        /**
         * Return wayBill table
         *
         * @param  object  object
         * @return object  table 
         */
        bolOrderTable           :   function(object) {
            var self = this;

            return {
                margin  :   [ 0, 20, 0, 20 ],
                table   :   self.parseBolOrderTable(object)
            };
        },
		
        /**
         * Return wayBill address fields
         *
         * @param  object  object
         * @return object  table 
         */
        bolAddresses: function( object ) {
			
			console.log( 'BOL-ADDRESS.OBJECT >> ', object );
			
            var self = this, 
				warehouses = object.warehouse,
				shipping = {}, 
				receiving = {},
                address = {};
			
            /*******************
             *  SHIPPING WAREHOUSE (FROM)
             *  
             */
            var from_id = object.from_warehouse.selected.id,
                from = object.manufacturer_info[0],
                fromList = warehouses.from;
                
            switch(from_id){
                case 0: shipping = {
                            value: from.value,
                            street: from.address.street.value,
                            city: from.address.city.value,
                            state: from.address.state.value,
                            zipcode: from.address.zipcode
                        };
                break;
                default: 
                    angular.forEach(fromList, function(row){ 
                        
                        parseInt(row.id) === parseInt(from_id) ? 
                            shipping = {
                                value: row.value,
                                street: row.address.street.value,
                                city: row.address.city.value,
                                state: row.address.state.value,
                                zipcode: row.address.zipcode
                            } : null;
                        
                    });
            }

            
            console.log( '|--------------------------------|' );
			console.log( 'SHIPPING-WAREHOUSE >> ', shipping );
            
            /*******************
             *  RECEIVING WAREHOUSE (TO)
             *  
             */
            var to_id = object.to_warehouse.selected.id,
                toList = warehouses.to;
            
            angular.forEach(toList, function(row){
                
                parseInt(row.id) === parseInt(to_id) ? 
                    receiving = {
                        value: row.value,
                        street: row.address.street.value,
                        city: row.address.city.value,
                        state: row.address.state.value,
                        zipcode: row.address.zipcode
                    } : null;
                
            });
            
            console.log( '|--------------------------------|' );
			console.log( 'RECEIVING-WAREHOUSE >> ', receiving );
            
            var fromAddress = shipping.street + ', ' + shipping.city + ',\n' + shipping.state + ' ' + shipping.zipcode;
            var toAddress = receiving.street + ', ' + receiving.city + ',\n' + receiving.state + ' ' + receiving.zipcode;
            
             address.columns = [
				self.docSignatureBox([
					self.docText(
						'FROM: ' + shipping.value, 
						[
							'textLeft',
							'bold',
							'lineHeader'
					]),
					self.docText(
						fromAddress, [
							'textLeft',
							'',
							'label'
						]
					)
				]),
				self.docSignatureBox([
					self.docText(
						'TO: ' +  receiving.value, 
						[
							'textLeft',
							'bold',
							'lineHeader'
					]),
					self.docText(
						toAddress, [
							'textLeft',
							'',
							'label'
						]
					)
				]),
			 ];
             
            return address;
        },
		
        /**
         * Return wayBill signature fields
         *
         * @return object  table 
         */
        bolSignatures: function () {
            var self = this;
            return {
                //Shipper and Recipient Addresses
                margin  :   [ 0, 20, 0, 20 ],
                columns :   [
                    [   self.docSignatureBox('','Driver Signature')   ],
                    [   self.docSignatureBox('','Reciever Signature') ]
                ]
            };
        },
		
        objectBox: function ( obj ) {

            var str = '';
            
            // SINGLE VALUE STRING FOR OBJECT
            utils.toType(obj) === 'string' ? str += utils.stringCapitalise(obj) : null;

            return str;
        },

        addressBox: function (key, item) {
            var str = '';

            if (item !== null) {
                angular.forEach(item, function (value, idx) {
                    str += '\n';
                    // OBJECT VALUE
                    utils.toType(value) === 'object' ?
                        str += utils.stringCapitalise(idx) + ': ' + utils.stringCapitalise(value.value) : null;
                    // OBJECT KEY
                    utils.toType(value) === 'string' ?
                        str += utils.stringCapitalise(idx) + ': ' + utils.stringCapitalise(value) : null;
                });
            }
            return str;
        },
		
        /**
         * Return Generic table
         *
         * @param  object  address
         * @return object  table 
         */
        docTable: function( object ){
			
			console.log( '|--------------------------------|' );
			console.log( 'DOC60-DOC-TABLE >> ', object );
            
            var tableHeader = [];
            
            var table = {
				style: 'table', 
				table: { 
					headerRows: 1, 
					body: []
				}, 
                layout: 'noBorders'
			};
            
            //// CREATE LINE ITEMS OBJECT
            //var lineItems = [];
            
            angular.forEach(object, function( parentItem ){
				
				console.log( '|--------------------------------|' );
				console.log( 'PARENT-ITEM >> ', parentItem );
                
                
                //// FETCH PRODUCTS FROM THIS PARENT-ITEM
                //var products = parentItem.products.value;
                //for(var i = 0; i < products.length; i++ ){
                //    lineItems.push({
                //        product: products[i].product,
                //        volume: products[i].litres_per_bottle,
                //        sku: products[i].sku,
                //        quantity: products[i].quantity
                //    });
                //}
                
                var tableRow = [];

                angular.forEach(parentItem, function( childItem, childKey ){      
					
					console.log( '|--------------------------------|' );
					console.log( childKey, childItem );
					
					
                    if(!utils.isNull(childItem) && utils.toType(childItem) === 'object'){
                        if(childItem.input !== 'json'){
                            (tableHeader.indexOf(childKey.toString().replace(/_/g, ' ').toUpperCase()) === -1) ?
                            tableHeader.push(childKey.toString().replace(/_/g, ' ').toUpperCase()) : null;
                        }
                    }
                });

                table.table.body.push(tableHeader);
                
                //Build Table        
                angular.forEach(parentItem,function(row, key){
                    
                    var str = '';
                    
                    if(!utils.isNull(row) && utils.toType(row) === 'object'){
                        
                        if( row.input === 'json' ){
                            
                            if( key === 'products'){
                                
                                console.log( '|---------------------|' );
                                console.log( 'ORDER LINE ITEMS >> ', row.value );
                                console.log( 'KEY >> ', key );
                                
                                return;
                            }
                            else{
                                return;
                            }

                        }
                        else{
                            
                            switch(row.input){
                                case 'select': 
                                    utils.toType(row.selected.value) !== 'null' ? 
                                        str = row.selected.value: str = ''; 
                                break;
                                case 'cs': 
                                    utils.toType(row.selected.value) !== 'null' ? 
                                        str = row.selected.value: str = ''; 
                                break;
                                case 'datetime': 
                                    utils.toType(row.value) !== 'null' ?
                                        str = moment(new Date(row.value)).format('MMM Do, YYYY'): str = ''; 
                                break;
                                default: 
                                    utils.toType(row.value) !== 'null' ? str = row.value: str = '';
                            }
                            
                        }
                        

                        console.log( '|------------------------|' );
                        console.log( 'KEY >> ', key );
                        
                        tableRow.push(str.toString());

                    }
                    
                });
                
                table.table.body.push(tableRow);
                
                console.log('Table',tableRow);
                                       
            });
                 
            console.log('Table >> ', table);
            
            return table;
            
        },
        
        /**
         * Return doc60 storetypes checkboxes
         *
         * @param  object  object
         * @return object  docStoreTypes 
         */
        docStoreTypes: function( row ){
            
            var customers = row; 
			
			console.log( '|--------------------------------|' );
			console.log( 'DOC-STORE-TYPES.CUSTOMERS >> ', customers );
			
            var storeTypes = [
                { 
                    id: 1,
                    value: 'Hospitality',
                    abbr: 'LIC',
                    checked: false
                },
                {
                    id: 2,
                    value: 'Agency',
                    abbr: 'MOS',
                    checked: false
                },
                {
                    id: 3,
                    value: 'LRS',
                    abbr: 'LRS',
                    checked: false
                },
                {
                    id: 4,
                    value: 'Grocery',
                    abbr: 'GRC',
                    checked: false
                },
                {
                    id: 5,
                    value: 'MOS',
                    abbr: 'MOS',
                    checked: false
                },
                {
                    id: 6,
                    value: 'Government Liquor Store',
                    abbr: 'GLS',
                    checked: false
                }
            ],
            docStoreTypes = [],
            self = this;
            
            storeTypes.map(function( item ){
                row.abbr === item.abbr ? 
					item.checked = true : 
					item.checked = false;      
				
                docStoreTypes.push( self.docCheckbox(
					item.value.toString(), 
					'textRight, tiny', 
					item.checked
				)); 
            });
            
            return docStoreTypes;
        },
		
        /**
         * Return signature box with a label
         *
         * @param  string  value
         * @param  string  label
         * @return object  docSignatureBox
         */
        docSignatureBox: function( item, label ){
            
            console.log( '|--------------------------------|' );
            console.log( 'DOC-60.DOC-SIGNATURE-BOX.ITEM >> ', item );
            console.log( 'DOC-60.DOC-SIGNATURE.BOX.LABEL >> ', label );
            
            var self = this;
            return {
                style: 'box',
                alignment:  'center',
                table: {
                        headerRows: 1,
                        widths  :   ['80%'],
                        body: [
                            [
                                self.docText( 
                                    item, 
                                    [ 
                                        'address', 
                                        'signature' 
                                    ] 
                                )
                            ],[ 
                                self.docText( 
                                    label, [ 
                                        'tiny' 
                                    ] 
                                )
                            ]                    
                        ]
                },
                layout: 'headerLineOnly'
            };
        },
		
         /**
         * Return input field with styling for the the input and label
         *
         * @param  string  inputName
         * @param  string  styleLabel
         * @param  string  styleInput
         * @param  string  input
         * @return object  docInput
         */
        docInput : function( inputName, styleLabel, styleInput, input ){
			
            var text = inputName +': ';
            
            return {
                margin      :   [0,0,0,10],
                columns     :   [
                    {
                        width   :   '50%',
                        text    :   text.toUpperCase(),
                        bold    :   true,
                        style   :   [ 'label', styleLabel ]
                    },{
                        width   :   'auto',
                        text    :   input,
                        style   :   [ 'label', styleInput ]
                    }
                ]
            }; 
        },
		
        /**
         * Return checkbox field with styling for the label
         *
         * @param  string  inputName
         * @param  string  styleLabel
         * @param  boolean  checked
         * @return object  docCheckbox
         */
        docCheckbox: function( str, css, bool ){
            var self = this;
 
            var checkbox = {
                
                margin: [ 0, 0, 0, 5 ],
                columns: [
                    {
                        width: '50%',
                        text: str.toUpperCase(),
                        bold: true,
                        style: [ 'label', css ]
                    },
					{},
					{
                        canvas: [ 
                            self.docShape(
                                { 
                                    type: 'rect', 
                                    x: 0, 
                                    y: 0, 
                                    width: 10, 
                                    height: 10, 
                                    lineWidth: 2 
                                }
                            ) 
                        ]
                    }
                ]
            };
            
            if( bool === true ){
               checkbox.columns[2].canvas.push({
                type: 'line',
                x1: 2, y1: 2,
                x2: 6, y2: 6,
                lineWidth: 2,
                lineColor:'red'
                },{
                type: 'line',
                x1: 6, y1: 6,
                x2: 10, y2: -3,
                lineWidth: 2,
                lineColor:'red'
                });  
            }
           
            return checkbox;
        },
		
        /**
         * Return generic text field with styling
         *
         * @param  string  text
         * @param  string  style
         * @return object  docText
         */
        docText: function( text, style ){
			
            var textArray = [];
			
            utils.toType(text) === 'array' ?
				
                text.map(function( item ){ textArray.push({ text: item || '', style: style }); }) : 
                textArray.push({ text: text || '', style: style });
			
			return textArray;
        },
		
         /**
         * Return a page break
         * @return object  docPageBreak
         */
        docPageBreak: function(){
            return { text: '', pageBreak: 'after' };
        },
		
        /**
         * Return generic image
         *
         * @param  string  path
         * @param  object  object
         *
         * @return object  docImage
         */
        docImage: function( path, object ){
			
			console.log( 'DOC-IMAGE.PATH >> ', path );
			console.log( 'DOC-IMAGE.OBJECT >> ', object );
			
            return  {
                image: path, 
				width: object.width, 
				height: object.height
             };
        },
		
        /**
         * Return vector image
         *
         * @param  string  path
         * @param  object  object
         *
         * @return object  docShape
         */
        docShape: function( object ){
			
          return {
			  type: object.type,
			  x: object.x, 
			  y: object.y, 
			  w: object.width, 
			  h: object.height, 
			  lineWidth: object.lineWidth ? object.lineWidth : 1, 
			  width: '*', 
			  style: object.style ? object.style : ''  
            };
			
        },
		
        /**
         * Return watermark text
         *
         * @param  string  text
         *
         * @return object  watermark
         */
        watermark : function(text){
			
            return {   
                    text: text, 
                    color: 'grey', 
                    opacity: 0.3, 
                    bold: true, 
                    italics: false
            };
        },
		
        /**
         * Convert Image to dataurl
         *
         * @param  string  imageUrl
         * @return dataUrl;
         */
        drawImage    :function(imageUrl){
            var dataUrl = '',
                canvas = document.createElement('CANVAS'),
                ctx = canvas.getContext('2d'),img, 
                image = new Image(); // HTML5 Constructor
            
            image.src = imageUrl || angular.element('#navlogo').attr('src');
            img = angular.element(image).addClass('drawImage').get(0);
            
            //angular.element('document').append(img);
            
            // console.log('Image',img);
            
            canvas.height = img.naturalHeight;
            canvas.width = img.naturalWidth;
            ctx.drawImage(img,0,0,img.naturalWidth,img.naturalHeight);
            dataUrl =   canvas.toDataURL('image/png',1.0);
            
            return dataUrl;
        },
		
        /**
         * Return pdfDocument stylesheet
         * @return object  docStyleOptions
         */
        docStyleOptions     :   function(){
            return {
                 docHeader  : {
                    bold        :   true,
                    alignment   :   'center',
                    fontSize    :   22,
                    margin      :   [ 0, 0, 0, 20 ] 
                },
				docFooter: {
					bold: false,
					alignment: 'left',
					fontSize: 8,
					margin: [10, 0, 0, 0 ]
				},
                tableHeader     :   {
                    bold        :   true,
                    alignment   :   'center',
                    fontSize    :   13
                },
                subHeader: {
                    bold : true,
                    alignment : 'center',
                    fontSize : 10
                },
                lineHeader     :   {
                    bold        :   true,
                    alignment   :   'left',
                    fontSize    :   12
                },
                tableText       :   {
                    alignment   :   'center',
                    fontSize    :   8,
                },
                table           :   {
                    bold        :   false,
                    fontSize    :   8,
                    margin      :   [ 0, 0, 0, 40 ]
                },
                tiny            :   {
                    fontSize    :   6
                },
                label           :   {
                    fontSize    :   9
                },
                textCenter      :   {
                    alignment   :   'center'
                },
                textRight      :   {
                    alignment   :   'right'
                },
                textLeft      :   {
                    alignment   :   'left'
                },
                marginBottom    :   {
                    margin      :   [ 0, 0, 0, 10 ]
                },
                red             :   {
                    color       :   '#FF0000'
                },
                signature       :   {
                    margin      :   [ 0, 30, 0, 0 ]
                },
                bold            :   {
                    bold        :   true
                },
                address            :   {
                    fontSize        :   10
                }
           };
        }

    };

});