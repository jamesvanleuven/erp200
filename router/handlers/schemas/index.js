'use strict';

module.exports = {
    
    products: [
        { label: 'products', type: 'text', length: '255', default: null, acl: '' },
        { label: 'sku', type: 'number', posix: 4, length: 10, default: 0, acl: '' },
        { label: 'batch_id', type: 'text', length: 30, default: null, acl: '', reference: 'extended_sku' },
        { label: 'batch_name', type: 'text', length: 30, default: null, acl: '' },
        { label: 'upc', type: 'number', length: 30, default: 0, acl: '' },
        { label: 'manufacturer', type: 'select', default: null, acl: 'admin', asset: 'manufacturers_type', reference: 'inventory', column: 'manufacturer_id' },
        { label: 'location', type: 'select', default: null, acl: 'admin', asset: 'location_type', reference: 'inventory', column: 'location_id' },
        { label: 'litres_per_bottle', type: 'number', length: 10, default: 0, acl: '' },
        { label: 'bottles_per_skid', type: 'number', length: 10, default: 0, acl: '' },
        { label: 'bottles_per_case', type: 'number', length: 10, default: 0, acl: '' },
        { label: 'alcohol_percentage', type: 'numeric', posix: 4, length: 10, default: '0.00', acl: '' },
        { label: 'litter_rate', type: 'numeric', posix: 2, length: 10, default: '0.00', acl: '' },
        { label: 'manufacturer_price', type: 'numeric', posix: 2, length: 10, default: '0.00', acl: '' },
        { label: 'retail_price', type: 'numeric', posix: 2, length: 10, default: '0.00', acl: '' },
        { label: 'wholesale_price', type: 'numeric', posix: 2, length: 10, default: '0.00', acl: '' },
        // { label: 'promo', type: 'boolean', default: 'true/false', acl: '' },
        { label: 'quantity', type: 'number', length: 10, default: 0, acl: '', reference: 'inventory' },
        { label: 'active', type: 'boolean', default: true, acl: '' }
    ],
    
    establishments: {},
    
};