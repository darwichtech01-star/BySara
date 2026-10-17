/** Bytes are authoritative: browser-reported MIME type and file extension are not trusted. */
export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
export const MAX_INPUT_PIXELS = 20_000_000;
export type RasterMime = 'image/jpeg' | 'image/png' | 'image/webp';
export function detectRasterMime(bytes: Uint8Array): RasterMime | null {
  if(bytes.length>=3 && bytes[0]===0xff && bytes[1]===0xd8 && bytes[2]===0xff) return 'image/jpeg';
  if(bytes.length>=8 && bytes[0]===137 && bytes[1]===80 && bytes[2]===78 && bytes[3]===71 && bytes[4]===13 && bytes[5]===10 && bytes[6]===26 && bytes[7]===10) return 'image/png';
  if(bytes.length>=12 && String.fromCharCode(...bytes.subarray(0,4))==='RIFF' && String.fromCharCode(...bytes.subarray(8,12))==='WEBP') return 'image/webp';
  return null;
}
export function isImageSizeAllowed(size: number):boolean {return Number.isSafeInteger(size)&&size>=128&&size<=MAX_UPLOAD_BYTES;}
/** Restrict any generated storage key to a new-product scoped namespace. Never use the client filename. */
export function imageStorageKey(productId:string,nonce:string):string {
 if(!/^[0-9a-f-]{36}$/i.test(productId)||!/^[0-9a-f-]{36}$/i.test(nonce))throw new Error('Invalid storage identifier');
 return `products/${productId}/${nonce}.webp`;
}
export function buildPublicObjectUrl(endpoint:string,bucket:string,key:string):string {
 const url=new URL(endpoint);
 if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash || !/^br-[a-z0-9-]+\.storage\.c-[0-9]+\.[a-z0-9-]+\.aws\.neon\.tech$/.test(url.hostname))throw new Error('Invalid Neon storage endpoint');
 if(!/^[a-z0-9-]+$/.test(bucket)||!/^products\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.webp$/i.test(key))throw new Error('Invalid object URL');
 return `${url.origin}/${bucket}/${key}`;
}
