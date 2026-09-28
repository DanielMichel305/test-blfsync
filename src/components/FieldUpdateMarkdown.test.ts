// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { renderFieldUpdateMarkdown } from './FieldUpdateMarkdown';

describe('renderFieldUpdateMarkdown', () => {
  it('renders common Markdown and applies safe external-link behavior', () => {
    const html = renderFieldUpdateMarkdown('# Update\n\n**Good news** and [read more](https://example.org).');

    expect(html).toContain('<h1>Update</h1>');
    expect(html).toContain('<strong>Good news</strong>');
    expect(html).toContain('href="https://example.org"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('removes scripts, event handlers, unsafe URLs, and dangerous embedded HTML', () => {
    const markdown = [
      '<script>alert(1)</script>',
      '<img src="https://example.org/image.jpg" onerror="alert(2)">',
      '<a href="javascript:alert(3)" onclick="alert(4)">unsafe</a>',
      '<iframe src="https://example.org/embed"></iframe>',
      '<p style="position:fixed">Safe embedded <strong>HTML</strong></p>',
    ].join('\n');
    const html = renderFieldUpdateMarkdown(markdown);

    expect(html).not.toMatch(/script|onerror|onclick|javascript:|iframe|position:fixed/i);
    expect(html).toContain('<strong>HTML</strong>');
    expect(html).toContain('src="https://example.org/image.jpg"');
  });

  it('handles malformed Markdown without returning executable markup', () => {
    const html = renderFieldUpdateMarkdown('[broken](javascript:alert(1)\n<div><svg onload=alert(2)>');

    expect(html).not.toMatch(/javascript:|onload/i);
    expect(html).toContain('broken');
  });
});
