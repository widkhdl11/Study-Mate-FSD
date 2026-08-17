import { AIRecommendedStudies } from '@/features/ai-recommend'
import { CtaSection, HomeWidget } from '@/widgets/home'

export default function HomePage() {
    return (
        <>
            <HomeWidget />
            <AIRecommendedStudies />
            <CtaSection />
        </>
    )
}
