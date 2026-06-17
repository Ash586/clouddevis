export function HelpContact() {
  return (
    <div className="bg-white border border-[#E4E0D8] rounded-xl p-6 text-center" id="contact">
      <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center text-[18px]" style={{ background: '#0B3D2E10' }}>
        💬
      </div>
      <h3 className="text-[14px] font-bold text-[#161616] mb-1">Vous n&apos;avez pas trouvé votre réponse ?</h3>
      <p className="text-[12px] text-[#999] mb-4 max-w-md mx-auto">
        Notre équipe de support est disponible pour vous aider. Nous répondons généralement sous 24 heures.
      </p>
      <div className="flex items-center justify-center gap-3">
        <a
          href="mailto:support@clouddevis.com"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-bold text-white transition hover:opacity-90"
          style={{ background: '#0B3D2E' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
          support@clouddevis.com
        </a>
      </div>
    </div>
  );
}
