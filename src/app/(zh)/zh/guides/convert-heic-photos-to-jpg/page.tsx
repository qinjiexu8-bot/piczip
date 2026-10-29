import { FeatureGuideArticle } from '@/components/guides/FeatureGuideArticle';
import { featureGuide } from '@/lib/next-features/guides';
import { createMetadata } from '@/lib/seo/metadata';
const guide = featureGuide('zh', 'heic');
export const metadata = createMetadata({ title: guide.title, description: guide.description, path: '/zh/guides/convert-heic-photos-to-jpg', type: 'article' });
export default function Page() { return <FeatureGuideArticle locale="zh" kind="heic" />; }
