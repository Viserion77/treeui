import practicesData from '../../../../docs/ai/practices.json';

const { practices, storybookDocPage } = practicesData;

// `./?path=...` resolves from the preview iframe to the manager URL in both dev
// and the deployed subpath; `target="_top"` keeps the manager from loading
// nested inside the docs iframe.
const practiceLink = (id: string, title: string) =>
  `<a target="_top" href="./?path=/docs/${storybookDocPage}--docs#${id}">${title}</a>`;

/**
 * Docs-page note for a story meta (`parameters.docs.description.component`)
 * listing the named TreeUI practices — from `docs/ai/practices.json` — that the
 * component follows, each linking to its section on Foundation/Practices.
 */
export const practiceNote = (componentName: string): string => {
  const followed = practices.filter((practice) => practice.components.includes(componentName));

  if (followed.length === 0) {
    return '';
  }

  const links = followed
    .map((practice) => practiceLink(practice.id, practice.title))
    .join(' · ');

  return `Follows the TreeUI practices: ${links}.`;
};
