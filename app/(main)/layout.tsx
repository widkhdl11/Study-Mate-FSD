import Footer from '@/widgets/footer/Footer';
import Header from '@/widgets/header/ui/Header';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <>
            <Header />
            {children}
            <Footer />
        </>
    )
}
