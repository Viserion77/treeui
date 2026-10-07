import practicesData from '../../../../docs/ai/practices.json';

const { practices, storybookDocPage } = practicesData;

// `./?path=...` resolves from the preview iframe to the manager URL in both dev
// and the deployed subpath; `target="_top"` keeps the manager from loading
// nested inside the docs iframe.
const practiceLink = (id: string, title: string) =>
  `<a target="_top" href="./?path=/docs/${storybookDocPage}--docs#${id}">${title}</a>`;

const practiceNoteForComponent = (componentName: string): string => {
  const followed = practices.filter((practice) => practice.components.includes(componentName));

  if (followed.length === 0) {
    return '';
  }

  const links = followed
    .map((practice) => practiceLink(practice.id, practice.title))
    .join(' · ');

  return `Follows the TreeUI practices: ${links}.`;
};

/**
 * Docs-page note for a story meta (`parameters.docs.description.component`)
 * listing the named TreeUI practices — from `docs/ai/practices.json` — that the
 * component follows, each linking to its section on Foundation/Practices.
 *
 * Pass a single component name for a story whose meta documents one
 * component — the output is a single, unprefixed sentence, unchanged from the
 * original single-argument form. Pass more than one name (e.g. a provider
 * story that also demonstrates a paired component) and each component gets
 * its own labelled block, listing only the practices IT follows — the sets
 * are never merged, since that would misstate which practices the other
 * component actually follows.
 */
export const practiceNote = (...names: string[]): string => {
  if (names.length <= 1) {
    return names.length === 0 ? '' : practiceNoteForComponent(names[0]);
  }

  return names
    .map((name) => {
      const note = practiceNoteForComponent(name);
      return note ? `**${name}** — ${note}` : '';
    })
    .filter((block) => block !== '')
    .join('\n\n');
};
