'use strict';
/**
 * Pick List factory added to $scope
 * Created on 24th September 2017
 * 
 * @name PickList Factory
 * @description This method returns all objects associated with Pick list pdf objects for pdfMake
 * METHODS
 * Pick list SECTIONS
 */

angular.module('clientApp').factory('picklist', function ($q, $rootScope, $location, $window, $compile, moment, utils) {
    
    //var defaultMargin = [ 0, 0, 0, 20 ];
    var aggregate = true;
    
    return {
        /**
         * Return document=
         *
         * @param  object  address
         * @return object  document 
         */
        createDocument: function( object ){
			
			console.log( '|--------------------------------|' );
			console.log( 'PICK-LIST.CREATEDOCUMENT> > > > > > >', object );
            
            var printObject = [];
            var index=0;
            
            for(index =0; index<object.length; index++){
                if(object[index].hasOwnProperty('order_id'))
                {
                    printObject.push({
                        order_id : object[index].order_id.value,
                        lineItems: this.getLineItems(object[index].products.value)
                        }
                    );
                }
                else{
                    printObject.push({
                            id : object[index].id,
                            lineItems: this.getLineItems(object[index].products.value)
                        }
                    );
                }
            }
            
            return this.buildDocument(printObject);
        },  
        
        buildDocument: function(printObject){
            var body = [];
                        
            // Loop through the object
            for(var index=0; index<printObject.length; index++){
                // Generate a line for each item in the printObject
                body.push(this.applyStyling(this.getOrderLine(printObject[index]), 'largeTextLeftAligned'));
                if(printObject[index].lineItems.length > 0){
                    // Put the table underneath the line
                    body.push({table: this.buildLineItemsTable(printObject[index].lineItems)});
                } 
            }
            
            console.log($rootScope.motto.toString());
            
            // Return the table;
            return body;
        },
        
        // Gets the row to build the line items into
        getLineItemRow: function(lineItems){
            // Create a row for line items if any for each order in printObject
            return [ this.getEmptyCell(), this.getEmptyCell(), { text: ' ', border: this.getBorderStyle('noBorders'),
                        colSpan: 6,
                        table: this.buildLineItemsTable(lineItems)}];
        },
        
        // Gets an empty cell with no borders
        getEmptyCell : function(){
            return {text:' ', border: this.getBorderStyle('noBorders')};
        },

        // Builds the table for the line items
        buildLineItemsTable: function(lineItems){
            // Call the line items table builder for the line items if any
            var body =[];
            
            body.push(this.applyStyling(this.getHeaderRow(lineItems), 'lineHeader', 'noBorders'));
            
            for(var index=0; index<lineItems.length; index++){
                body.push(this.applyStyling(this.getOrderRow(lineItems[index]), 'tableRow', 'noBorders'));
            }
            
            return {
                widths: ['*', '*', '*', '*'],
                headerRows:1,
                body: body,
            };
        },
        
        // Apply styling requirements to the row
        applyStyling: function(row, styling, borderStyle){
            switch(utils.toType(row)){
                case 'array':
                    for(var index=0; index<row.length; index++){
                        row[index] = { text: row[index] || '', style: styling, border: this.getBorderStyle(borderStyle)};
                    }
                    break;
                default:
                    row = {text: row || '', style: styling};
                    break;
            }
            return row;
        },
        
        getOrderRow: function(orderRow){
            var rowItems = [];
            angular.forEach(orderRow, function(key){
                                if(utils.toType(key)!== 'array'){
                                    this.push(key.toString());
                                }
                            }, rowItems);
            return rowItems;
        },
        
        getOrderLine: function(orderRow){
            var keyItems = [], valueItems = [];
            angular.forEach(orderRow, function(key, value){
                                if(utils.toType(key)!== 'array'){
                                    this.push(key.toString());
                                    valueItems.push(value);
                                }
                            }, keyItems);
            return valueItems[0].toString().replace('_', ' ').toUpperCase() + ' : ' + keyItems[0].toString();
        },
        
        getLineItems: function(object)
        {   
            if(object === null){
                return null;
            }
            var lineItems = [];
            
            for(var index = 0; index< object.length; index++){
                var lineItem = {
                    product: object[index].product,
                    sku: object[index].sku,
                    quantity: object[index].quantity,
                    volume: object[index].litres_per_bottle
                };
                lineItems.push(lineItem);
            }
            
            return lineItems;
        },
        
        /*
        * Builds the row to be used as a header for a table
        */
        getHeaderRow : function(printObject){
            var header = [],
                iterator = printObject[0];
            
            for(var key in iterator){
                if(utils.toType(iterator[key]) !== 'array'){
                    header.push(key.toString().replace('_', ' ').toUpperCase());
                }
            }
            
            return header;
        },
                
        buildExcelDocument: function( object ){
			
			console.log( '|--------------------------------|' );
			console.log( 'picklist.CREATEEXCELDOCUMENT > > >', object );
            
            var index=0, internalIndex=0;
            var lineItemsArray = [], arr = [];
            
            for(index=0; index<object.length; index++){
                arr = this.getLineItems(object[index].products.value);
                for(internalIndex = 0; internalIndex<arr.length; internalIndex++){
                    lineItemsArray.push(this.getSearchableSKUObject(arr[internalIndex]));
                }
            }
                        
            return this.createCSVFromObjectArray(lineItemsArray.sort(function(a, b) {return a.sku-b.sku;}));
        },
        
        createCSVFromObjectArray : function (arrayOfObjects){
            var table = [],
                tableHeader = this.getCSVHeader(arrayOfObjects[0].lineItem),
                tableBody = [];
            
            console.log(' Array of Objects >> ', arrayOfObjects);
            
            if(aggregate === true){
                arrayOfObjects = this.aggregateObjects(arrayOfObjects);
            }
            
            for(var index=0; index<arrayOfObjects.length; index++){
                var tableRow = '';
                
                for(var key in arrayOfObjects[index].lineItem){
                    if(utils.toType(arrayOfObjects[index].lineItem[key]) !== 'undefined' &&
                      utils.toType(arrayOfObjects[index].lineItem[key]) !== 'null'){
                        tableRow += arrayOfObjects[index].lineItem[key].toString().toUpperCase() + ',';
                        }
                    else{
                        tableRow += ' ,';
                    }
                }
                tableBody += tableRow + '\n';
                }
            
            table += tableHeader + '\n';
            table += tableBody;
            
            return table;
        },
        
        // Pseudo code @ pseudo_code/aggregating the data
        aggregateObjects : function (arrayOfObjects){
            var aggregatedArray = [],
                index=0,
                skuFirstIndex =0,
                skuLastIndex = skuFirstIndex;
                        
            while(index<=(arrayOfObjects.length-1)){
                skuFirstIndex = index;
                skuLastIndex = this.findLastIndexOf(index, arrayOfObjects, arrayOfObjects[index].sku);
                var quantity = 0;
                                
                for(var internalIndex=skuFirstIndex; internalIndex<=skuLastIndex; internalIndex++){
                    if(arrayOfObjects[internalIndex].lineItem.product === arrayOfObjects[skuFirstIndex].lineItem.product){
                        quantity += arrayOfObjects[internalIndex].lineItem.quantity;
                    }
                }
                aggregatedArray.push({
                    sku: arrayOfObjects[index].sku,
                    lineItem: {
                        product: arrayOfObjects[index].lineItem.product,
                        sku: arrayOfObjects[index].lineItem.sku,
                        quantity: quantity,
                        volume: arrayOfObjects[index].lineItem.volume
                    }
                });
                                
                index = skuLastIndex + 1;
            }
            
            console.log(' This is the aggregated array >> ', aggregatedArray);
            return aggregatedArray;
        },
        
        findLastIndexOf : function(index, arrayOfObjects, sku){
            var lastIndex = index;
            
            while(lastIndex <= (arrayOfObjects.length-1)){
                if((lastIndex +1) <= (arrayOfObjects.length -1 )){
                    if(arrayOfObjects[lastIndex + 1].sku === sku){
                        lastIndex ++;
                    }
                    else{
                        break;
                    }
                }
                else{
                    break;
                }
            }
            
            return lastIndex;
        },
        
        getSearchableSKUObject : function(lineItem){
            return {
                sku: lineItem.sku,
                lineItem: lineItem
            };
        },
        
        getCSVHeader : function(object){
            var header = [];
            for(var key in object)
            {
                header.push(key.toString().toUpperCase());
            }
            return header;
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
                textArray.push({ text: text || '', style: style});
			
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
        
        getBorderStyle: function(borderStyle){
            var borderStyles = {
              'allBorders': [true, true, true, true],
              'noBorders': [false, false, false, false],
              'bottomLine': [false, false, false, true],
              'topLine': [false, true, false, false],
              'leftLine': [true, false, false, false],
              'rightLine': [false, false, true, false]
            };
            return borderStyles[borderStyle];
        },
        
        picklistStylingOptions : function(){
            return {
                docHeader : {
                    bold : true,
                    alignment : 'center',
                    fontSize : 22,
                    margin : [ 0, 0, 0, 20 ] 
                },
                docFooter: {
                    bold: false,
                    alignment: 'left',
                    fontSize: 8,
                    margin: [10, 0, 0, 0 ]
                },
                tableHeader : {
                    bold : true,
                    alignment : 'left',
                    fontSize : 12,
                    fillColor: 'lightgray'
                },
                lineHeader : {
                    bold : true,
                    alignment : 'left',
                    fontSize : 10,
                    fillColor : 'lightgray'
                },
                table : {
                    bold : false,
                    fontSize : 8,
                    margin : [ 0, 0, 0, 40 ],
                    layout: 'noBorders'
                },
                tableRow : {
                    bold: false,
                    fontSize : 10,
                    alignment : 'left'
                },
                textRight: {
                    bold: true,
                    fontSize: 32,
                    alignment: 'right'
                },
                largeTextLeftAligned:{
                    bold: true,
                    fontSize: 12,
                    alignment: 'left'
                },
                basicTextLeftAligned: {
                    bold: false,
                    fontSize: 10,
                    alignment: 'left'
                },
                basicTextRightAligned: {
                    bold: false,
                    fontSize: 10,
                    alignment: 'right'
                },
                basicTextCenterAligned: {
                    bold: false,
                    fontSize: 10,
                    alignment: 'center'
                }
            };
        },
        
        testTable : function()
        {
            return {
			style: 'tableExample',
			table: {
				body: [
					['Column 1', 'Column 2', 'Column 3'],
					[
						{
							stack: [
								'Let\'s try an unordered list',
								{
									ul: [
										'item 1',
										'item 2'
								    ]
				                }
				            ]
						},
				        [
				            'or a nested table',
							{
								table: {
									body: [
										['Col1', 'Col2', 'Col3'],
										['1', '2', '3'],
										['1', '2', '3']
								    ]
				                },
				            }
				        ],
				            {text: [
								'Inlines can be ',
								{text: 'styled\n', italics: true},
				                {text: 'easily as everywhere else', fontSize: 10}]
				            }
				        ],
                    ['Column 1', 'Column 2', 'Column 3'],
					[
						{
							stack: [
								'Let\'s try an unordered list',
								{
									ul: [
										'item 1',
										'item 2'
								    ]
				                }
				            ]
						},
				        [
				            'or a nested table',
							{
								table: {
									body: [
										['Col1', 'Col2', 'Col3'],
										['1', '2', '3'],
										['1', '2', '3']
								    ]
				                },
				            }
				        ],
				            {text: [
								'Inlines can be ',
								{text: 'styled\n', italics: true},
				                {text: 'easily as everywhere else', fontSize: 10}]
				            }
				        ]
				    ]
                }
            };
        }

    };

});