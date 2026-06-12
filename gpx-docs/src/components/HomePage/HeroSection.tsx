import { useState } from 'react';
import Link from '@docusaurus/Link';

const InstallPill = () => {
    const [copied, setCopied] = useState(false);
    const command = 'npm install -g @mindfiredigital/gpx';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(command);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { }
    };

    return (
        <div
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl font-mono text-sm"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--muted-fg)' }}
        >
            <div className="flex flex-col">
                <span>$ {command}</span>
                <span className="text-xs opacity-60 mt-1">Also works with yarn, pnpm, and bun</span>
            </div>
            <button
                onClick={handleCopy}
                title={copied ? 'Copied!' : 'Copy'}
                className="bg-transparent border-none cursor-pointer p-1 rounded-md transition-colors duration-300 hover:text-red-500"
                style={{ color: 'var(--muted-fg)' }}
            >
                {copied ? '✓' : '⧉'}
            </button>
        </div>
    );
}
export const HeroSection = () => {
    return (
        <section className="text-center py-20 px-6 relative flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
                Switch Git Identities,{' '}
                <span className="text-red-600 dark:text-red-500">Instantly</span>
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--muted-fg)' }}>
                nvm for Git profiles - manage SSH keys, emails, and signing configs
                across multiple GitHub accounts with a single command. <br/>
                <span className="font-semibold text-sm mt-2 block">Works on macOS, Linux, and Windows.</span>
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap mb-10">
                <Link
                    to="/docs/Introduction"
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-red-600 font-semibold text-base no-underline transition-all duration-300 hover:no-underline hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,0,0,0.25)]"
                    style={{ color: '#ffffff' }}
                >
                    Get Started
                </Link>
                <Link
                    to="https://github.com/mindfiredigital/gpx"
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-transparent font-semibold text-base no-underline border transition-all duration-300 hover:no-underline hover:-translate-y-0.5"
                    style={{ borderColor: 'var(--card-border)', color: 'var(--ifm-font-color-base)', border: '1px solid var(--card-border)' }}
                >
                    ⭐ GitHub
                </Link>
            </div>
            <InstallPill />
        </section>
    );
}
