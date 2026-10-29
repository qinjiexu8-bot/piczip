import { FeatureRoute, featureMetadata } from '@/components/next-features/FeatureRoute';
export const metadata = featureMetadata('en', 'heic');
export default function Page() { return <FeatureRoute locale="en" kind="heic" />; }
