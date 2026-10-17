import {test} from 'node:test';
import assert from 'node:assert/strict';
import {safeCatalog,whatsappLink,isPublishedProduct,usd} from '../src/lib/storefront.ts';
const product={id:'verified-id',slug:'valid-published-product',name:'Verified published item',brand:'Approved brand',category:'Face Care',description:'Approved product description',imageUrl:'https://example.com/approved-image.jpg',priceUsd:12.5,currency:'USD',sku:'VALID-001',variantLabel:'Size 30ml'};
test('incomplete catalog entries do not become visible products',()=>{assert.deepEqual(safeCatalog({status:'ready',items:[{id:'fake'},product]}).items,[product]);assert.deepEqual(safeCatalog({status:'not-configured',items:[product]}).items,[])});
test('reject invalid or incomplete published products',()=>{assert.equal(isPublishedProduct({...product,priceUsd:0}),false);assert.equal(isPublishedProduct({...product,imageUrl:'javascript:alert(1)'}),false);assert.equal(isPublishedProduct({...product,sku:''}),false)});
test('WhatsApp link requires valid verified destination and URL-encodes the inquiry',()=>{assert.equal(whatsappLink('','Hello'),null);assert.equal(whatsappLink('123','Hello'),null);assert.equal(whatsappLink('+961 70 123 456','Hello & Sara'),'https://wa.me/96170123456?text=Hello%20%26%20Sara')});
test('currency formatting remains USD',()=>assert.match(usd(12.5),/\$12\.50/));
