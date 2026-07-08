import Link from 'next/link';
import { DemoEditor } from '@/components/editor/DemoEditor';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-navy-900">
      <header className="border-b border-navy-700 bg-navy-900/85 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-slate-100 font-bold text-lg">Rakmana</Link>
          <Link href="/auth/register" className="text-slate-300 hover:text-white text-xs font-semibold">
            Créer un compte →
          </Link>
        </div>
      </header>
      <div className="h-[calc(100vh-52px)]">
        <DemoEditor onDownload={() => {}} />
      </div>
    </div>
  );
}