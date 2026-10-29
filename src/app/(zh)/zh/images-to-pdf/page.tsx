import { FeatureRoute, featureMetadata } from '@/components/next-features/FeatureRoute';
export const metadata = featureMetadata('zh', 'pdf');
export default function Page() { return <FeatureRoute locale="zh" kind="pdf" />; }
