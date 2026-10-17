import {test,expect} from '@playwright/test';
test('storefront renders brand and public navigation without seeded product claims',async({page})=>{
 await page.goto('/');
 await expect(page.getByText('BY SARA',{exact:false}).first()).toBeVisible();
 await expect(page.locator('body')).not.toContainText('1,248 / 1,248');
});
test('shop gracefully handles an empty verified public catalog',async({page})=>{
 await page.goto('/shop');
 await expect(page.locator('body')).toBeVisible();
 await expect(page.locator('body')).not.toContainText('Sample Product');
});
test('unauthenticated admin is not authorized',async({request})=>{
 const response=await request.get('/api/admin');
 expect([401,403]).toContain(response.status());
 const payload=await response.json();
 expect(payload.status).not.toBe('authorized');
});
test('unauthenticated media uploads cannot occur',async({request})=>{
 const response=await request.post('/api/admin/media',{headers:{Origin:'https://untrusted.example','Content-Type':'application/json'},data:'{}'});
 expect([401,403]).toContain(response.status());
});
