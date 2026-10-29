import { FeatureGuideArticle } from '@/components/guides/FeatureGuideArticle';
import { featureGuide } from '@/lib/next-features/guides';
import { createMetadata } from '@/lib/seo/metadata';
const guide = featureGuide('en', 'pdf');
export const metadata = createMetadata({ title: guide.title, description: guide.description, path: '/guides/combine-images-into-pdf', type: 'article' });
export default function Page() { return <FeatureGuideArticle locale="en" kind="pdf" />; }
