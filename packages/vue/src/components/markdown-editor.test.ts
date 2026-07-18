import { mount } from '@vue/test-utils';
import TMarkdownEditor from './TMarkdownEditor.vue';

/**
 * These tests assert on the *rendered preview HTML*, which is injected with
 * v-html. Anything that reaches the preview is live DOM, so URL schemes and
 * generated markup are part of the security surface.
 */

const preview = (markdown: string, sanitize?: (html: string) => string) => {
  const wrapper = mount(TMarkdownEditor, {
    props: sanitize ? { modelValue: markdown, sanitize } : { modelValue: markdown },
  });
  return wrapper.find('.t-md-editor__preview');
};

const NUL = String.fromCharCode(0);

describe('TMarkdownEditor preview — URL scheme allowlist', () => {
  const blockedLinks = [
    ['plain javascript:', '[click me](javascript:alert`document.cookie`)'],
    ['case variation', '[click me](JaVaScRiPt:alert(1))'],
    ['leading whitespace', '[click me](   javascript:alert(1))'],
    ['trailing whitespace', '[click me](javascript:alert%281%29   )'],
    ['embedded tab', '[click me](java\tscript:alert(1))'],
    ['embedded carriage return', '[click me](java\rscript:alert(1))'],
    ['NUL padding', `[click me](java${NUL}script:alert(1))`],
    ['leading NUL', `[click me](${NUL}javascript:alert(1))`],
    ['vbscript:', '[click me](vbscript:msgbox(1))'],
    ['data: html', '[click me](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)'],
    ['file:', '[click me](file:///etc/passwd)'],
    ['blob:', '[click me](blob:https://evil.example/uuid)'],
  ] as const;

  it.each(blockedLinks)('blocks %s in links', (_label, markdown) => {
    const p = preview(markdown);

    // No clickable element at all — the payload can never fire.
    expect(p.findAll('a')).toHaveLength(0);
    // The allowlist rejected it (rather than the link regex simply missing).
    expect(p.find('.t-md-editor__blocked-link').exists()).toBe(true);
    // But the content is not silently dropped.
    expect(p.text()).toContain('click me');
    // And no stray NUL leaks into the DOM.
    expect(p.html()).not.toContain(NUL);
  });

  it('marks a rejected link as inert text', () => {
    const p = preview('[click me](javascript:alert(1))');

    const blocked = p.find('.t-md-editor__blocked-link');
    expect(blocked.exists()).toBe(true);
    expect(blocked.element.tagName).toBe('SPAN');
    expect(blocked.text()).toContain('click me');
  });

  const allowedLinks = [
    ['https', '[x](https://example.com/a)', 'https://example.com/a'],
    ['http', '[x](http://example.com/a)', 'http://example.com/a'],
    ['mailto', '[x](mailto:a@example.com)', 'mailto:a@example.com'],
    ['tel', '[x](tel:+5511999999999)', 'tel:+5511999999999'],
    ['root-relative', '[x](/docs/intro)', '/docs/intro'],
    ['dot-relative', '[x](./guide.md)', './guide.md'],
    ['bare relative', '[x](guide.md)', 'guide.md'],
    ['anchor', '[x](#section-1)', '#section-1'],
    ['query only', '[x](?page=2)', '?page=2'],
    ['protocol-relative', '[x](//example.com/a)', '//example.com/a'],
  ] as const;

  it.each(allowedLinks)('permits %s in links', (_label, markdown, href) => {
    const anchor = preview(markdown).find('a');

    expect(anchor.exists()).toBe(true);
    expect(anchor.attributes('href')).toBe(href);
    expect(anchor.attributes('rel')).toBe('noopener noreferrer');
    expect(anchor.attributes('target')).toBe('_blank');
  });

  it('keeps ampersands in permitted query strings intact', () => {
    const anchor = preview('[x](https://example.com/?a=1&b=2)').find('a');

    expect(anchor.attributes('href')).toBe('https://example.com/?a=1&b=2');
  });

  const blockedImages = [
    ['javascript:', '![alt](javascript:alert(1))'],
    ['case + whitespace', '![alt]( JaVaScRiPt:alert(1))'],
    ['data:text/html', '![alt](data:text/html;base64,PHN2Zz4=)'],
    ['data:image/svg+xml', '![alt](data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=)'],
    ['mailto (not an image)', '![alt](mailto:a@example.com)'],
  ] as const;

  it.each(blockedImages)('blocks %s in images', (_label, markdown) => {
    const p = preview(markdown);

    expect(p.findAll('img')).toHaveLength(0);
    expect(p.find('.t-md-editor__blocked-link').exists()).toBe(true);
    expect(p.text()).toContain('alt');
  });

  const allowedImages = [
    ['https', '![alt](https://example.com/a.png)', 'https://example.com/a.png'],
    ['relative', '![alt](/assets/a.png)', '/assets/a.png'],
    [
      'data:image/png',
      '![alt](data:image/png;base64,iVBORw0KGgo=)',
      'data:image/png;base64,iVBORw0KGgo=',
    ],
  ] as const;

  it.each(allowedImages)('permits %s in images', (_label, markdown, src) => {
    const img = preview(markdown).find('img');

    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe(src);
    expect(img.attributes('alt')).toBe('alt');
  });

  const entityEvasions = [
    ['decimal entity scheme head', '[click me](&#106;avascript:alert(1))'],
    ['hex entity scheme body', '[click me](jav&#x61;script:alert(1))'],
    ['uppercase hex entity', '[click me](jav&#X61;script:alert(1))'],
    ['entity-encoded colon', '[click me](javascript&#58;alert(1))'],
    ['entity without semicolon', '[click me](&#106avascript:alert(1))'],
  ] as const;

  it.each(entityEvasions)('blocks %s', (_label, markdown) => {
    const p = preview(markdown);

    expect(p.findAll('a')).toHaveLength(0);
    expect(p.find('.t-md-editor__blocked-link').exists()).toBe(true);
    expect(p.text()).toContain('click me');
  });

  it('does not leak placeholder characters into a mixed document', () => {
    const p = preview(
      '# [a](/x_1) title\n\n![i](/i_1.png) and [b](https://e.com/a_b) plus _em_ and `code`\n\n- [c](javascript:alert(1))\n\n> [d](mailto:a@e.com)',
    );

    expect(p.html()).not.toContain(NUL);
    expect(p.html()).not.toContain('undefined');
    expect(p.findAll('a').map((a) => a.attributes('href'))).toEqual([
      '/x_1',
      'https://e.com/a_b',
      'mailto:a@e.com',
    ]);
    expect(p.find('img').attributes('src')).toBe('/i_1.png');
  });

  it('still escapes raw HTML inside link labels', () => {
    const p = preview('[<img src=x onerror=alert(1)>](https://example.com)');

    expect(p.findAll('img')).toHaveLength(0);
    expect(p.find('a').text()).toContain('<img src=x onerror=alert(1)>');
  });
});

describe('TMarkdownEditor preview — inline emphasis must not corrupt link markup', () => {
  it('renders two links on one line without eating the _blank underscore', () => {
    const p = preview('[a](/x) | [b](/y)');

    const anchors = p.findAll('a');
    expect(anchors).toHaveLength(2);
    expect(anchors[0].attributes('href')).toBe('/x');
    expect(anchors[1].attributes('href')).toBe('/y');
    anchors.forEach((a) => expect(a.attributes('target')).toBe('_blank'));
    expect(p.html()).not.toContain('<em>blank');
  });

  it('renders a link followed by emphasis without corrupting either', () => {
    const p = preview('See [docs](/a) and _emphasis_ here');

    const anchor = p.find('a');
    expect(anchor.attributes('href')).toBe('/a');
    expect(anchor.attributes('target')).toBe('_blank');
    expect(anchor.text()).toBe('docs');

    const em = p.findAll('em');
    expect(em).toHaveLength(1);
    expect(em[0].text()).toBe('emphasis');
    expect(p.text()).toContain('here');
    expect(p.html()).not.toContain('<em>blank');
  });

  it('preserves underscores inside URLs', () => {
    const p = preview('[x](https://example.com/a_b_c/d_e_f)');

    expect(p.find('a').attributes('href')).toBe('https://example.com/a_b_c/d_e_f');
    expect(p.findAll('em')).toHaveLength(0);
  });

  it('preserves underscores inside image URLs', () => {
    const p = preview('![x](/assets/a_b_c.png)');

    expect(p.find('img').attributes('src')).toBe('/assets/a_b_c.png');
    expect(p.findAll('em')).toHaveLength(0);
  });

  it('does not let asterisks in a URL start emphasis', () => {
    const p = preview('[x](/search?q=*star*) and **bold**');

    expect(p.find('a').attributes('href')).toBe('/search?q=*star*');
    expect(p.find('strong').text()).toBe('bold');
    expect(p.findAll('em')).toHaveLength(0);
  });

  it('does not let backticks or tildes in a URL start code or strikethrough', () => {
    const p = preview('[x](/a`b`c/~~d~~)');

    expect(p.find('a').attributes('href')).toBe('/a`b`c/~~d~~');
    expect(p.findAll('code')).toHaveLength(0);
    expect(p.findAll('del')).toHaveLength(0);
  });

  it('still applies emphasis inside link labels', () => {
    const p = preview('[**bold** label](/x)');

    const anchor = p.find('a');
    expect(anchor.attributes('href')).toBe('/x');
    expect(anchor.find('strong').text()).toBe('bold');
  });

  it('renders links inside headings, lists and blockquotes intact', () => {
    const p = preview('# [a](/x) and [b](/y)\n\n- [c](/z_1) and _em_\n\n> [d](/w) and _em_');

    const anchors = p.findAll('a');
    expect(anchors.map((a) => a.attributes('href'))).toEqual(['/x', '/y', '/z_1', '/w']);
    expect(p.html()).not.toContain('<em>blank');
  });

  it('leaves markdown inside fenced code blocks untouched', () => {
    const p = preview('```\n[a](/x) | [b](/y)\n```');

    expect(p.findAll('a')).toHaveLength(0);
    expect(p.find('pre').text()).toContain('[a](/x) | [b](/y)');
  });
});

describe('TMarkdownEditor sanitize hook', () => {
  it('passes the rendered html through the sanitize prop', () => {
    const sanitize = vi.fn((html: string) => html.replace(/<a /g, '<a data-checked="1" '));
    const p = preview('[x](https://example.com)', sanitize);

    expect(sanitize).toHaveBeenCalledTimes(1);
    expect(sanitize.mock.calls[0][0]).toContain('<a href="https://example.com"');
    expect(p.find('a').attributes('data-checked')).toBe('1');
  });

  it('lets a consumer enforce a stricter policy than the built-in allowlist', () => {
    const sanitize = (html: string) => html.replace(/<img[^>]*>/g, '');
    const p = preview('![alt](https://example.com/a.png)', sanitize);

    expect(p.findAll('img')).toHaveLength(0);
  });

  it('renders unsanitized output when no sanitize prop is given', () => {
    expect(preview('[x](https://example.com)').findAll('a')).toHaveLength(1);
  });
});
