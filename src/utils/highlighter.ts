import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';

export function highlightCode(code: string, language: 'python' | 'javascript'): string {
  try {
    const gram = language === 'python' ? Prism.languages.python : Prism.languages.javascript;
    if (!gram) {
      return escapeHtml(code);
    }
    return Prism.highlight(code, gram, language);
  } catch (e) {
    console.error('Highlighter error:', e);
    return escapeHtml(code);
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
