'use client';

import { useMemo } from 'react';

function parseMarkdown(md: string): string {
  let html = md;

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-[14px] font-bold text-[#161616] mt-6 mb-2">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-[16px] font-black text-[#0B3D2E] mt-8 mb-3">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-[20px] font-black text-[#161616] mt-0 mb-4">$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-[#161616]">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em class="italic text-[#666]">$1</em>');

  // Inline code
  html = html.replace(/`(.+?)`/g, '<code class="text-[11px] px-1.5 py-0.5 rounded bg-[#F0EFEC] text-[#0B3D2E] font-mono">$1</code>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-3 pl-4 py-2 my-3 text-[12px] text-[#666] italic" style="border-color: #C4A35A">$1</blockquote>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="text-[12px] text-[#444] leading-relaxed mb-1 ml-4 list-disc">$1</li>');

  // Ordered lists
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="text-[12px] text-[#444] leading-relaxed mb-1 ml-4 list-decimal">$2</li>');

  // Tables
  html = html.replace(/\|(.+)\|/g, (match) => {
    const cells = match.split('|').filter(c => c.trim());
    if (cells.every(c => c.trim().match(/^-+$/))) return '';
    const isHeader = cells.some(c => c.trim().match(/^-+$/));
    if (isHeader) return '';
    const tag = 'td';
    return `<tr class="border-b border-[#F0EFEC]">${cells.map(c => `<${tag} class="px-3 py-2 text-[11px] text-[#444]">${c.trim()}</${tag}>`).join('')}</tr>`;
  });

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="border-0 border-t border-[#E4E0D8] my-6" />');

  // Paragraphs (lines that aren't already HTML)
  html = html.split('\n').map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '<br />';
    if (trimmed.startsWith('<')) return line;
    return `<p class="text-[12.5px] text-[#444] leading-[1.7] mb-2">${trimmed}</p>`;
  }).join('\n');

  // Clean up nested lists
  html = html.replace(/<li class="([^"]*)">/g, '<li class="$1">');

  return html;
}

export function HelpArticleContent({ content }: { content: string }) {
  const html = useMemo(() => parseMarkdown(content), [content]);

  return (
    <div
      className="prose-help"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
