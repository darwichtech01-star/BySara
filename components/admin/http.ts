export type AdminFailure={error?:string};
export async function adminRequest<T>(path:string,method:'GET'|'POST'|'PATCH'='GET',payload?:unknown):Promise<T>{
 const response=await fetch(path,{method,credentials:'same-origin',cache:'no-store',headers:payload===undefined?undefined:{'Content-Type':'application/json'},body:payload===undefined?undefined:JSON.stringify(payload)});
 let data:unknown;try{data=await response.json()}catch{throw new Error('Server returned an invalid response')}
 if(!response.ok){const detail=data as AdminFailure;throw new Error(detail.error||`Request failed (${response.status})`)}
 return data as T;
}
