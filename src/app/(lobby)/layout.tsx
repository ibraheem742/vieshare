import { SiteFooter } from "@/components/layouts/site-footer"
import { SiteHeader } from "@/components/layouts/site-header"

interface LobyLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
}

export default function LobyLayout({ children, modal }: LobyLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {children}
        {modal}
      </main>
      <SiteFooter />
    </div>
  )
}
