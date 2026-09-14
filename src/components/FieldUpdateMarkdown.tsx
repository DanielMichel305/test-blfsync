import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

export function renderFieldUpdateMarkdown(mdBody: string) {
  const parsed = marked.parse(mdBody, { async: false, breaks: true, gfm: true });
  const sanitized = DOMPurify.sanitize(parsed, {
    ALLOWED_TAGS: ['a', 'blockquote', 'br', 'code', 'del', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'img', 'li', 'ol', 'p', 'pre', 'strong', 'table', 'tbody', 'td', 'th', 'thead', 'tr', 'ul'],
    ALLOWED_ATTR: ['alt', 'href', 'src', 'title'],
    FORBID_ATTR: ['style'],
  });
  const template = document.createElement('template');
  template.innerHTML = sanitized;
  template.content.querySelectorAll('a').forEach(link => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });
  return template.innerHTML;
}

export function FieldUpdateMarkdown({ mdBody, className = '', label }: { mdBody: string; className?: string; label?: string }) {
  const html = useMemo(() => renderFieldUpdateMarkdown(mdBody), [mdBody]);
  return (
    <div
      className={`field-update-markdown ${className}`}
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
