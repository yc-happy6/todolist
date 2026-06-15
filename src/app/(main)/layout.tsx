import { Navbar } from '@/components/navbar'
import { PageTransition } from '@/components/page-transition'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
    </>
  )
}
