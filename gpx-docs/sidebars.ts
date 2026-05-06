import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'Introduction',
    'Installation',
    {
      type: 'category',
      label: 'Commands',
      collapsed: false,
      items: [
        'commands/Add',
        'commands/Use',
        'commands/Ls',
        'commands/Current',
        'commands/Remove',
        'commands/Show',
        'commands/Edit',
        'commands/Run',
        'commands/Doctor',
        'commands/Export',
        'commands/Import',
        'commands/Init',
        'commands/Completion',
        'commands/Config',
      ],
    }
  ],
};

export default sidebars;