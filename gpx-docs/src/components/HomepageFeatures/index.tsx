import type { ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Switch Identities Instantly',
    description: (
      <>
        Switch between multiple Git profiles with a single command. No more
        manually editing <code>~/.gitconfig</code> every time you change projects.
      </>
    ),
  },
  {
    title: 'SSH Key Management',
    description: (
      <>
        Automatically generate SSH keys, upload them to GitHub, and configure
        your SSH config - all in one step with <code>gpx add --generate-ssh</code>.
      </>
    ),
  },
  {
    title: 'GitHub OAuth Built-in',
    description: (
      <>
        Authenticate with GitHub using the Device Flow - no client secret needed.
        GPX handles token storage securely per profile.
      </>
    ),
  },
];

function Feature({ title, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}