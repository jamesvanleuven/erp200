'use strict';
/**
 * Print factory for the orders and transfers module
 * Created on 26th September 2017
 * 
 * @name Print Pick Factory
 * @description Needs to be built to work with the report printing in the orders and transfers module
 */

angular.module('clientApp').factory('pickprint', function ($q, $rootScope, $location, $window, $compile, moment, utils) {
    
    //var defaultMargin = [ 0, 0, 0, 20 ];
    var headerCount = 0;
    
    return {
        /**
         * Return Generic table
         *
         * @param  object  address
         * @return object  table 
         */
        createTable: function( object ){
			
			console.log( '|--------------------------------|' );
			console.log( 'PRINT-PICK.CREATETABLE > > > > > >', object );
            
            var printObject = [];
            var index=0;
            if(object[index].hasOwnProperty('order_id')){
                for(index =0; index<object.length; index++){
                    printObject.push(
                        {
                            order_id : object[index].order_id.value,
                            order_reference : object[index].order_reference.value,
                            license_number: object[index].license_number.value,
                            customer: object[index].customer.selected.value,
                            address: object[index].address.value,
                            city: object[index].city.selected.value,
                            manufacturer: object[index].manufacturer.selected.value,
                            location: object[index].location.selected.value,
                            lineItems: this.getLineItems(object[index].products.value)
                        }
                    );
                }
            }
            else{
                for(index =0; index<object.length; index++){
                    printObject.push(
                        {
                            id : object[index].id,
                            manufacturer : object[index].manufacturer.selected.value,
                            from_warehouse : object[index].from_warehouse.selected.value,
                            to_warehouse : object[index].to_warehouse.selected.value,
                            created_date : object[index].created_date.value,
                            delivery_date : object[index].deliver_date.value,
                            status : object[index].status.selected.value,
                            pickup : object[index].pickup.value,
                            rush : object[index].rush.value,
                            transfer_type: object[index].transfer_type.selected.value,
                            lineItems: this.getLineItems(object[index].products.value)
                        }
                    );
                }
            }
            
            return this.buildTable(printObject);
        },
        
        buildTable: function(printObject){
            var body = [];
            var headerRow = this.applyStyling(this.getHeaderRow(printObject), 'tableHeader', 'noBorders');
            headerCount = headerRow.length;
            
            body.push(headerRow);
            
            // Loop through the object
            for(var index=0; index<printObject.length; index++){
                // Create a row for each item in the printObject array
                body.push(this.applyStyling(this.getOrderRow(printObject[index]), 'tableRow','topLine'));
                if(printObject[index].lineItems.length > 0){
                    // Insert a row with a colSpan of 6 and the first two cells empty
                    body.push(this.getLineItemRow(printObject[index].lineItems));
                } 
            }
            console.log($rootScope.motto.toString());

            return {
                table:{
                    headerRows: 1,
                    body: body,
                }
            };
        },
        
        // Gets the row to build the line items into
        getLineItemRow: function(lineItems){
            // Create a row for line items if any for each order in printObject
            return [ this.getEmptyCell(), this.getEmptyCell(), { text: ' ', border: this.getBorderStyle('noBorders'),
                        colSpan: headerCount-2,
                        table: this.buildLineItemsTable(lineItems)}];
        },
        
        // Gets an empty cell with no borders
        getEmptyCell : function(){
            return {text:' ', border: this.getBorderStyle('noBorders')};
        },
              
        //Builds the table for the line items
        buildLineItemsTable: function(lineItems){
            // Call the line items table builder for the line items if any
            var body =[];
            
            body.push(this.applyStyling(this.getHeaderRow(lineItems), 'lineHeader', 'noBorders'));
            
            for(var index=0; index<lineItems.length; index++){
                body.push(this.applyStyling(this.getOrderRow(lineItems[index]), 'tableRow', 'noBorders'));
            }
            
            return {
                widths: [180, 75, 50, 50],
                body: body,
            };
        },
        
        //Apply styling requirements to the row
        applyStyling: function(row, styling, borderStyle){
                for(var index=0; index<row.length; index++){
                    row[index] = { text: row[index] || '', style: styling, border: this.getBorderStyle(borderStyle)};
                }
            return row;
        },
        
        getOrderRow: function(orderRow){
            var rowItems = [];
            angular.forEach(orderRow, function(key){
                                if(utils.toType(key)!== 'array'){
                                    if(utils.toType(key) !== 'null' && utils.toType(key) !== 'undefined'){
                                        this.push(key.toString());
                                    }
                                    else{
                                        this.push(' ');
                                    }
                                }
            }, rowItems);
            return rowItems;
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
        
        //Builds the row to be used as a header for a table
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
        
        pickprintStylingOptions : function(){
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
                    fontSize : 13,
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
        }
    };

});