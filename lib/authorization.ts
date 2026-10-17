/** Application-level capabilities checked server-side against the active Neon Auth identity. */
export type Role = 'owner'|'admin'|'editor'|'viewer';
export type Capability = 'catalog:read'|'catalog:write'|'catalog:publish'|'taxonomy:write'|'media:write'|'inventory:adjust'|'staff:manage'|'audit:read';
const grants:Record<Role,readonly Capability[]>={
 owner:['catalog:read','catalog:write','catalog:publish','taxonomy:write','media:write','inventory:adjust','staff:manage','audit:read'],
 admin:['catalog:read','catalog:write','catalog:publish','taxonomy:write','media:write','inventory:adjust'],
 editor:['catalog:read','catalog:write'],
 viewer:['catalog:read']
};
export function can(role:Role|null,capability:Capability):boolean {return role!==null && grants[role]?.includes(capability)===true;}
export function capabilitiesFor(role:Role|null):Capability[]{return role?[...grants[role]]:[];}
