import { AIRecommendedStudies } from '@/components/AIRecommendedStudies'
import HomeUI from './ui'

export default function HomePage() {
    return (
        <>
            <HomeUI />
            <section className='my-8 px-4'>
                <AIRecommendedStudies />
            </section>
        </>
    )
}
