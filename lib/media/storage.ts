import 'server-only';
import {DeleteObjectCommand,PutObjectCommand,S3Client} from '@aws-sdk/client-s3';
import {buildPublicObjectUrl} from './validation';
import {assertStorageTarget,parseTarget} from '@/lib/runtime-target';
export const MEDIA_BUCKET='by-sara-v2-product-media';
let s3:S3Client|undefined;
function getConfig(){
 const endpoint=process.env.AWS_ENDPOINT_URL_S3??'';
 const accessKeyId=process.env.AWS_ACCESS_KEY_ID??'';
 const secretAccessKey=process.env.AWS_SECRET_ACCESS_KEY??'';
 const region=process.env.AWS_REGION??'';
 assertStorageTarget(endpoint,process.env.NEON_STORAGE_BRANCH_ID??'',parseTarget(process.env.BY_SARA_TARGET));
 if(!accessKeyId||!secretAccessKey||region!=='eu-central-1')throw new Error('Greenfield media storage not configured');
 return {endpoint,accessKeyId,secretAccessKey,region};
}
export function mediaStorageReady():boolean{try{getConfig();return true;}catch{return false;}}
function getS3():S3Client{
 const cfg=getConfig();
 return s3??=new S3Client({region:cfg.region,endpoint:cfg.endpoint,forcePathStyle:true,
  credentials:{accessKeyId:cfg.accessKeyId,secretAccessKey:cfg.secretAccessKey},
  requestChecksumCalculation:'WHEN_REQUIRED',maxAttempts:2});
}
export async function storeProductWebp(key:string,bytes:Uint8Array):Promise<string>{
 const cfg=getConfig();
 const url=buildPublicObjectUrl(cfg.endpoint,MEDIA_BUCKET,key);
 await getS3().send(new PutObjectCommand({Bucket:MEDIA_BUCKET,Key:key,Body:bytes,ContentType:'image/webp',CacheControl:'public, max-age=31536000, immutable'}));
 return url;
}
export async function cleanupProductObject(key:string):Promise<void>{await getS3().send(new DeleteObjectCommand({Bucket:MEDIA_BUCKET,Key:key}));}
