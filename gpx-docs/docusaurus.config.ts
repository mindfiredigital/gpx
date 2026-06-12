import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'GPX',
  tagline: 'Git Profile eXchanger - nvm for Git Identities',
  favicon: 'img/logo.png',

  url: 'https://mindfiredigital.github.io',
  baseUrl: '/gpx/',

  organizationName: 'mindfiredigital',
  projectName: 'gpx',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: false,

        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    metadata: [
      {
        name: 'description',
        content: 'Git Profile eXchanger - switch between git identities instantly',
      },
      {
        name: 'keywords',
        content: 'gpx, git, profile, switcher, identity, ssh, cli, git profile manager, mindfire, mindfiredigital, open, source, opensource',
      },
    ],
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'GPX',
      logo: {
        alt: 'mindfireLogo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://github.com/mindfiredigital/gpx',
          className: 'header--github-link', 'aria-label': 'GitHub repository',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `© ${new Date().getFullYear()} Mindfire FOSS`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
