import { AIRecommendedStudies } from '@/components/AIRecommendedStudies'
import { HomeWidget } from '@/widgets/home'

export default function HomePage() {
    return (
        <>
            <HomeWidget />
            <section className='my-8 px-4'>
                <AIRecommendedStudies />
            </section>
        </>
    )
}
