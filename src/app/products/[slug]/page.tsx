import {StoreLayout} from '@/components/StoreLayout';import {ProductDetail} from '@/components/store/Detail';
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <StoreLayout><ProductDetail slug={slug}/></StoreLayout>}
