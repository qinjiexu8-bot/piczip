import { FeatureRoute, featureMetadata } from '@/components/next-features/FeatureRoute';
export const metadata = featureMetadata('en', 'flow');
export default function Page() { return <FeatureRoute locale="en" kind="flow" />; }
