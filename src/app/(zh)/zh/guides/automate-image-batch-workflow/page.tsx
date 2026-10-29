import { FeatureGuideArticle } from '@/components/guides/FeatureGuideArticle';
import { featureGuide } from '@/lib/next-features/guides';
import { createMetadata } from '@/lib/seo/metadata';
const guide = featureGuide('zh', 'flow');
export const metadata = createMetadata({ title: guide.title, description: guide.description, path: '/zh/guides/automate-image-batch-workflow', type: 'article' });
export default function Page() { return <FeatureGuideArticle locale="zh" kind="flow" />; }
