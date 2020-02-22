'use strict';

/**
 * Created: 2017-07-25
 * Author: James Van Leuven <james.mendham@directtap.com>
 * Modules: REPORTS
 */

var express = require('express'),
    router = express.Router(),
    db = require("../../../database"),
    moment = require('moment'),
    jwt = require('jsonwebtoken'),
    expressJwt = require('express-jwt'),
    secret = (process.env.JWT_SECRET).toString(),
    auditHandler = require('../audit-handler'),
    utils = require('../../utils/index.js'),
    clc = require('cli-color');

var reportResults = function(sql, params, filter){
    
    db.task(function(t){

        return db.any(sql, params)
        .then(function(reports){

            console.log( '|------------------------------|' );
            console.log( 'REPORT-RESULT >> ', reports[0] );
            console.log( 'TOTAL-RECORDS >> ', reports[0].totalRecords);

            return reports;

        })
        .catch(function(error){

            console.log( '|------------------------------|' );
            console.log( 'REPORT-ERROR >> ', error );
            
            return error;

        });

    })
    .then(function(result){

        console.log( '|------------------------------|' );
        console.log( 'REPORT--RESULT >> ', result );

        var rows = result[0],
            data = ({
                rows: rows,
                limit: limit,
                offset: offset,
                status: 200
            });

        data.filter = filters;

        response.push( data );

        console.log('|---------------------------------------------|');
        console.log( information( 'SQL RESULT ROWS >>> ', response ));

        // return res.status(status).json(response);
        return response;

    })
    .catch(function(error){

        console.log( '|------------------------------|' );
        console.log( 'FINAL-ERROR >> ', error );

        // return res.status(200).json(error);
        
        return error;

    });
    
};

var defaultSQL = function(group, role){
    return {
        id: 0, 
        name: 'summary', 
        alias: 'summary transaction report' , 
        acl_group :[group], 
        acl_role :[role]
    }
};

var filterParams = function(filters){
    
    var filterList = '',
        manufacturers = filters.manufacturers,
        locations = filters.locations,
        range = filters.range;
    
    for (var i = 0; i <= filters.length - 1; i++) {
        var thisFilter = JSON.parse(filters[i]),
            thisType = thisFilter.type, 
            thisField = thisFilter.field,
            thisValue = thisFilter.value;
        
        /*
        console.log( '|-----------------------------------------|' );
        console.log( 'thisType >> ', thisType );
        console.log( '|-----------------------------------------|' );
        console.log( 'thisField >> ', thisField );
        console.log( '|-----------------------------------------|' );
        console.log( 'thisValue >> ', thisValue );
        */

        var numeric = ['numeric(10,2)', 'numeric(10,4)', 'bigint', 'money', 'integer'], 
            text = ['character varying', 'text'],
            bool = ['True/False'],
            datetime = ['timestamp without time zone'];

        // console.log( '|-----------------------------------------|' );
        // console.log( 'text.indexOf(thisType)', text.indexOf(thisType ));

        // IS ARRAY SYS ADMIN GROUP
        if( thisType === 'array' ){

            filterList += " AND (a.";
            filterList += thisField;

            thisValue === 0 ? 
                filterList += "::integer NOT IN(SELECT(UNNEST(ARRAY[" :
                filterList += "::integer IN(SELECT(UNNEST(ARRAY[";

            filterList += thisValue;
            filterList += "]::integer[]))))";
        }
        
        // IS DATETIME FILTER
        if( datetime.indexOf(thisType) !== -1 ){
             var filterDates = thisValue.split(':');
            filterList += " AND (DATE(a.";
            filterList += thisField;
            filterList += ") >= DATE('" + filterDates[0];
            filterList += " 00:00:00') AND DATE(a.";
            filterList += thisField;
            filterList += ") <= DATE('" + filterDates[1];
            filterList += " 23:59:59'))"; 
        } 
        // IS BOOLEAN FILTER
        if( bool.indexOf(thisType) !== -1 ){
            filterList += " AND (a.";
            filterList += thisField;
            filterList += " = " + thisValue + ")";
        }
        // IS TEXT FILTER
        if( text.indexOf(thisType) !== -1 ){
            filterList += " AND (CAST(a."; 
            filterList += thisField;
            filterList += " AS TEXT) ILIKE";
            filterList += " '%" + thisValue + "%')";
        }
        // IS NUMERIC FILTER
        if( numeric.indexOf(thisType) !== -1 ){
            filterList += " AND (CAST(a."; 
            filterList += thisField;
            filterList += " AS TEXT) LIKE";
            filterList += " '%" + thisValue + "%')";
        }
    }
    
    return filterList;
    
};

var buildParams = function(profile, filter){
    
	var dDate = moment(new Date()), 
		thisMonth = dDate.month() + 1, 
		thisYear = dDate.year(), 
		dateRange = utils.setDateRange(thisYear, thisMonth),
		startDate = dateRange.start,
		endDate = dateRange.end;
    /*
    console.log( '|-----------------------------------------|' );
    console.log( 'REPORT-PARAMS.PROFILE >> ', profile );
    console.log( 'REPORT-PARAMS.FITLER >> ', filter );
    */
    
    var manufacturers = 0,
        locations = 0, 
        range = {
            startDate: startDate,
            endDate: endDate
        };
    
    // NON-SYSTEM-GROUP ESTABLISHMENT
    if( profile.establishment !== 0 && utils.isNaN(profile.establishment) === false ){
        manufacturers = profile.establishment;
        locations = [];
        
        for(var i = 0; i < locations.length; i++ ){
            locations.push(locations[i].id);
        }
    }
    
    // DATE-RANGE
    if(utils.toType(filter.range) !== 'undefined' ){
        var thisRange = filter.range.value;
    }
    /*
    console.log( '|-----------------------------------------|' );
    console.log( 'MANUFACTURER >> ', manufacturers );
    console.log( 'LOCATIONS >> ', locations );
    console.log( 'RANGE >> ', range );
    */
    
    return [
        JSON.stringify({ 
            field: 'created', 
            type: 'timestamp without time zone', 
            alias: 'range',
            value: moment(range.startDate).format('YYYY-MM-DD') + ':' + moment(range.endDate).format('YYYY-MM-DD') 
        }),
        JSON.stringify({
            field: 'location_id',
            alias: 'location',
            type: 'array',
            value: locations
        }),
        JSON.stringify({
            field: 'manufacturer_id',
            alias: 'manufacturer',
            type: 'array',
            value: manufacturers
        })
    ];
    
};

var getReports = function (req, res) {

    // VARIABLES
    var failure = clc.xterm(202),
        warning = clc.yellow,
        information = clc.xterm(25),
        successful = clc.green, 
        header = req.headers,
        host = header.host,
        method = req.method,
        request = header['x-requested-with'],
        token = header.authorization.replace('Bearer ', ''),
        params = req.params,
		report = req.query.report,
        results = JSON.parse(req.query.params),
        moduleType = parseInt(results.type),
        manufacturers = req.query.manufacturers,
        establishment = parseInt(req.query.establishment),
        locations = req.query.locations,
        location = parseInt(req.query.location),
        customers = req.query.customers,
        report = parseInt(req.query.report),
        module = parseInt(results.id),
        filters = [],
        filterList = null,
        orderList = '',
        paging = results.paging,
        limit = parseInt(paging.limit, 0),
        offset = parseInt(paging.offset, 0),
        body = req.body,
        cookies = req.cookies,
        type_id = 0;

	console.log( '|================================|' );
	console.log( '     GET-REPORTS.JS               ' );
	console.log( '|================================|' );
	console.log( '' );
    
    console.log( '|-----------------------------------------|' );
    console.log( information( 'moduleType', moduleType )); 
    console.log( '|-----------------------------------------|' );
    console.log( information(  'establishment', establishment ));
    console.log( '|-----------------------------------------|' );
    console.log( information(  'location', location ));
    console.log( '|-----------------------------------------|' );
    console.log( information(  'locations', locations ));
    console.log( '|-----------------------------------------|' );
    console.log( information(  'manufacturers', manufacturers ));
    console.log( '|-----------------------------------------|' );
    console.log( information( 'customers', customers ));
    console.log( '|-----------------------------------------|' );
    console.log( information( 'report', report ) );
    console.log( '|-----------------------------------------|' );
    console.log( information( 'module', module ) );
    console.log( '|-----------------------------------------|' );
	console.log( information( 'PARAMS >> ', JSON.stringify(params, null, 2) ) );
    console.log( '|-----------------------------------------|' );
    console.log( information( 'RESULTS', JSON.stringify(req.query, null, 2) ) );
    console.log( '|-----------------------------------------|' );
    console.log( information( 'FILTERS.TOTYPE', utils.toType(req.query.filters) ));
    
    /*
    // CONVERT FILTER TO STRING IF ARRAY
    utils.toType(req.query.filters) === 'array' ? 
        req.query.filters = JSON.stringify(req.query.filters) : null;
    
    console.log( '|-----------------------------------------|' ); 
    console.log( information( 'FILTERS', req.query.filters ));
    
    // PAGING
    if (paging.range) {
        offset = parseInt(paging.range.lower, 0);
        limit = parseInt(paging.limit, 0);
    }

    // FILTERS
    if ( utils.toType(req.query.filters) !== 'undefined') {
		
		var filterRequest = JSON.parse(req.query.filters);
		
		console.log( '|-----------------------------------------|' );
		console.log( 'FILTER EXISTS >> ', filterRequest );
		console.log( 'FILTER.LENGTH >> ', filterRequest.length );
		
		// SET DEFAULT DATE RANGE
		if( utils.toType(filterRequest.length) === 'undefined' ){
            
            var filterDate = moment(new Date(startDate)).format('YYYY-MM-DD');
            filterDate += ':' + moment(new Date(endDate)).format('YYYY-MM-DD');
            
            var filterLocation = [];
            utils.toType()

			filterRequest = [
				JSON.stringify({ 
					field: 'created', 
					type: 'timestamp without time zone', 
					value: moment(new Date(startDate)).format('YYYY-MM-DD') + ':' + moment(new Date(endDate)).format('YYYY-MM-DD') 
				}),
				JSON.stringify({
					field: 'location_id',
					type: 'array',
					value: locations
				}),
				JSON.stringify({
					field: 'manufacturer_id',
					type: 'array',
					value: utils.toType(manufacturers) !== 'undefined' ? manufacturers : [establishment]
				})
			];

		}
        
        filterList = "";
        (filterRequest instanceof Array) ? filters = filterRequest : filters.push(filterRequest);
        
        console.log( '|-----------------------------------------|' );
        console.log( 'FILTERS >> ', filters );

        for (var i = 0; i <= filters.length - 1; i++) {
            var thisFilter = JSON.parse(filters[i]),
                thisType = thisFilter.type, 
                thisField = thisFilter.field,
                thisValue = thisFilter.value;
			
			// HACK FOR TRANSFER_ID SEARCH COLUMN
			// ( thisField === 'transfer_id' ) ? thisField = 'id': null;
			
            console.log( '|-----------------------------------------|' );
            console.log( 'thisType >> ', thisType );
            console.log( '|-----------------------------------------|' );
            console.log( 'thisField >> ', thisField );
            console.log( '|-----------------------------------------|' );
            console.log( 'thisValue >> ', thisValue );

            
            var numeric = ['numeric(10,2)', 'numeric(10,4)', 'bigint', 'money', 'integer'], 
                text = ['character varying', 'text'],
                bool = ['True/False'],
                datetime = ['timestamp without time zone'];
            
            console.log( '|-----------------------------------------|' );
            console.log( 'text.indexOf(thisType)', text.indexOf(thisType ));
            
            // IS ARRAY SYS ADMIN GROUP
            if( thisType === 'array' && establishment === 0 ){

                filterList += " AND (a.";
                filterList += thisField;
                
                thisValue === 0 ? 
                    filterList += "::integer NOT IN(SELECT(UNNEST(ARRAY[" :
                    filterList += "::integer IN(SELECT(UNNEST(ARRAY[";
                    
                filterList += thisValue;
                filterList += "]::integer[]))))";
            }
            
            // IS ARRAY NOT SYS ADMIN GROUP
            if( thisType === 'array' && establishment !== 0 ){
                filterList += " AND (a.";
                filterList += thisField;
                thisField === 'location_id' && thisValue === 0 ? 
                    filterList += "::integer NOT IN(SELECT(UNNEST(ARRAY[": 
                    filterList += "::integer IN(SELECT(UNNEST(ARRAY[";
                filterList += thisValue;
                filterList += "]::integer[]))))";
            }
            
            // IS DATETIME FILTER
            if( datetime.indexOf(thisType) !== -1 ){
                 var filterDates = thisValue.split(':');
                filterList += " AND (DATE(a.";
                filterList += thisField;
                filterList += ") >= DATE('" + filterDates[0];
                filterList += " 00:00:00') AND DATE(a.";
                filterList += thisField;
                filterList += ") <= DATE('" + filterDates[1];
                filterList += " 23:59:59'))"; 
            } 
            // IS BOOLEAN FILTER
            if( bool.indexOf(thisType) !== -1 ){
                filterList += " AND (a.";
                filterList += thisField;
                filterList += " = " + thisValue + ")";
            }
            // IS TEXT FILTER
            if( text.indexOf(thisType) !== -1 ){
                filterList += " AND (CAST(a."; 
                filterList += thisField;
                filterList += " AS TEXT) ILIKE";
                filterList += " '%" + thisValue + "%')";
            }
            // IS NUMERIC FILTER
            if( numeric.indexOf(thisType) !== -1 ){
                filterList += " AND (CAST(a."; 
                filterList += thisField;
                filterList += " AS TEXT) LIKE";
                filterList += " '%" + thisValue + "%')";
            }
        }
        
        console.log('|---------------------------------------------|');
        console.log( information( 'filterList', filterList ));
    }
*/
	
    // CREDENTIALS
    var jwtOptions = { typ: 'JWT', alg: 'HS512' };
    jwt.verify(token, secret, jwtOptions, function (err, decoded) {

        var response = [],
            status = 200,
            pquery = [];
        if (err) {
            var data = {
                error: err,
                msg: 'Your token is invalid',
                status: 403
            };
            response.push(data);
        }

        if (decoded){
            var credentials = decoded.payload.credentials,
                profile = jwt.decode(decoded.payload.user, secret),
                user = jwt.decode(decoded.payload.user.idx, secret),
                key = jwt.decode(decoded.payload.enc, secret),
                expires = moment.utc(decoded.payload.exp).tz('America/Vancouver').format(),
                iat = moment.utc(decoded.iat).tz('America/Vancouver').format(),
                sql = '',
                group = credentials.group_id,
                role = credentials.role_id;
            
            utils.toType(profile) === 'null' ? profile = JSON.parse(req.query.profile) : null;
            
            // BEGIN BUILDING REPORTS 
            /*
            console.log( '|================================|' );
            console.log( '     REPORT-CREDENTIALS           ' );
            console.log( '|================================|' );
            console.log( '' );
            console.log( 'PROFILE >> ', profile );
            console.log( '|-----------------------------------------|' );
            console.log( 'GROUP >> ', group );
            console.log( 'ROLE >> ', role );
            */
            
            var filter = JSON.parse(req.query.filters),
                filterLen = utils.countJSON(filter),
                reportType = 0;
            
            // TEST FOR REPORT TYPE IS-NaN
            utils.isNaN(report) === false ? 
                reportType = parseInt(report) : 
                null;
            
            console.log( '|-----------------------------------------|' );
            console.log( 'FILTER >> ', filter );
            console.log( 'FILTER.LENGTH >> ', filterLen );
            console.log( 'REPORT-TYPE >> ', reportType );
            
            db.task(function(t){
                return db.any('SELECT row_to_json(t) AS type FROM(SELECT * FROM public.bi_types WHERE id::bigint = $1::bigint) t;', [reportType])
                .then(function(type){
                    
                    // DEFAULT REPORT TYPE = SUMMARY TRANSACTIONS
					type.length === 0 ? type = defaultSQL(group, role) : null;
					return type;
                    
                })
                .catch(function(error){
                    
                    return error;
                    
                });
            })
            .then(function(results){
                
                console.log( '|-----------------------------------------|' );
                console.log( 'RESULTS >> ', results );
                
                // REPORT SQL 
                var sql = 'SELECT * FROM bi_' + results.name;
                sql += '_all($1::integer, $2::integer, $3::character varying, $4::character varying) AS reports;';
                
                // REPORT PARAMS
                var params = [
                    parseInt(limit),
                    parseInt(offset),
                    filterParams(buildParams(profile, filter)),
                    null
                ];
                
                console.log( '|-----------------------------------------|' );
                console.log( 'SQL >> ', sql );
                console.log( 'PARAMS >> ', params );
                
                // var thisReport = reportResults(sql, params, buildParams(profile, filter));
                
                // console.log( '|-----------------------------------------|' );
                // console.log( 'THIS-REPORT >> ', thisReport );
                
                // return res.status(status).json(thisReport);
                
                db.task(function(t1){

                    return db.any(sql, params)
                    .then(function(reports){

                        // console.log( '|------------------------------|' );
                        // console.log( 'REPORT-RESULT >> ', reports[0] );
                        // console.log( 'TOTAL-RECORDS >> ', reports[0].totalRecords);

                        return reports;

                    })
                    .catch(function(error){

                        console.log( '|------------------------------|' );
                        console.log( 'REPORT-ERROR >> ', error );

                        return error;

                    });

                })
                .then(function(result){

                    // console.log( '|------------------------------|' );
                    // console.log( 'REPORT--RESULT >> ', result );

                    var rows = result[0],
                        data = ({
                            rows: rows,
                            limit: limit,
                            offset: offset,
                            status: 200,
                            filter: {}
                        });

                    data.filter = buildParams(profile, filter);
                    
                    console.log('|---------------------------------------------|');
                    console.log( information( 'DATA-FILTER >>> ', data.filter ));

                    response.push( data );

                    return res.status(status).json(response);

                })
                .catch(function(error){

                    console.log( '|------------------------------|' );
                    console.log( 'FINAL-ERROR >> ', error );

                    return res.status(200).json(error);

                });
                
            })
            .catch(function(error){
                
                console.log( '|-----------------------------------------|' );
                console.log( 'ERROR >> ', error );
                
                return res.status(status).json(error);
                
            });

            /*
			db.task(function(t){
				return db.any('SELECT row_to_json(t) FROM(SELECT * FROM public.bi_types WHERE id::bigint = $1::bigint) t;', [parseInt(report)])
				.then(function(type){

					type.length === 0 ? 
						type = {
							id: 0, 
							name: 'summary', 
							alias: 'summary transaction report' , 
							acl_group :[], 
							acl_role :[]
						} : null;

					return type;

				})
				.catch(function(error){

					return error;

				});

			})
			.then(function(reportType){
				
				var reportParams = req.query;

				console.log( '|------------------------------|' );
				console.log( 'REPORT-TYPE >> ', reportType );
				console.log( 'REPORT-PARAMS >> ', reportParams );
				
				utils.toType(reportParams.manufacturers) !== 'array' ? 
					reportParams.manufacturers = [reportParams.manufacturers] : null;
                
                var reportLocations = [];
                report === 0 ? 
                    reportLocations = [reportParams.location] : 
                    reportLocations = reportParams.locations;

				// RETUN THE REPORT SELECTED HERE
				var rSQL = 'SELECT * FROM bi_' + reportType.name, 
					rQUERY = [
						parseInt(limit),
						parseInt(offset),
						filterList,
                        null
					];
				
				rSQL += '_all($1::integer, $2::integer, $3::character varying, $4::character varying) AS reports;';
				
				console.log( '|------------------------------|' );
				console.log( 'R-SQL >> ', rSQL );
				console.log( '|------------------------------|' );
				console.log( 'R-QUERY >> ', rQUERY );
				
				db.task(function(t1){
					
					return db.any(rSQL, rQUERY)
					.then(function(reports){
						
						console.log( '|------------------------------|' );
						console.log( 'REPORT-RESULT >> ', reports[0] );
                        console.log( 'TOTAL-RECORDS >> ', reports[0].totalRecords);
						
						return reports;
						
					})
					.catch(function(error){
						
						console.log( '|------------------------------|' );
						console.log( 'REPORT-ERROR >> ', error );
						
					});
					
				})
				.then(function(result){
					
					console.log( '|------------------------------|' );
					console.log( 'REPORT--RESULT >> ', result );
					
					var rows = result[0],
						data = ({
							rows: rows,
							limit: limit,
							offset: offset,
							status: 200
						});

					data.filter = filters;

					response.push( data );

					console.log('|---------------------------------------------|');
					console.log( information( 'SQL RESULT ROWS >>> ', response ));

					return res.status(status).json(response);
					
				})
				.catch(function(error){
					
					console.log( '|------------------------------|' );
					console.log( 'FINAL-ERROR >> ', error );
					
					return res.status(200).json(error);
					
				});


			})
			.catch(function(error){

				console.log( '|------------------------------|' );
				console.log( 'ERROR >> ', error );

			});
            */
		
        }
   });
};

module.exports = getReports;