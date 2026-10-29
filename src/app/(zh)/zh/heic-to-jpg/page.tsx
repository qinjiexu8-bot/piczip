import { FeatureRoute, featureMetadata } from '@/components/next-features/FeatureRoute';
export const metadata = featureMetadata('zh', 'heic');
export default function Page() { return <FeatureRoute locale="zh" kind="heic" />; }
