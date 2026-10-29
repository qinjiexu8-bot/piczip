import { FeatureRoute, featureMetadata } from '@/components/next-features/FeatureRoute';
export const metadata = featureMetadata('en', 'pdf');
export default function Page() { return <FeatureRoute locale="en" kind="pdf" />; }
