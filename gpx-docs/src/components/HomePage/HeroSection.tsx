import { useState } from 'react';
import Link from '@docusaurus/Link';
import { motion, AnimatePresence } from 'framer-motion';
import { packageManagers } from '../../constants/packageManagers';
import { StarIcon } from './icons/StarIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

const InstallPill = () => {
    const [activeTab, setActiveTab] = useState(packageManagers[0]);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(activeTab.command);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-col w-full max-w-[500px] rounded-2xl p-2 shadow-sm mx-auto"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
        >
            {/* Package-manager tabs */}
            <div className="flex gap-1.5 justify-center mb-2 mt-1">
                {packageManagers.map((pm) => (
                    <button
                        key={pm.id}
                        onClick={() => { setActiveTab(pm); setCopied(false); }}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-200 border-none cursor-pointer
                            ${activeTab.id === pm.id
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'bg-transparent hover:bg-gray-500/10'}`}
                        style={{ color: activeTab.id === pm.id ? '#fff' : 'var(--muted-fg)' }}
                    >
                        {pm.label}
                    </button>
                ))}
            </div>

            {/* Command box */}
            <div
                className="flex items-center justify-between gap-4 px-5 py-3 rounded-xl font-mono text-sm w-full"
                style={{ background: 'rgba(0, 0, 0, 0.15)', border: '1px solid var(--card-border)', color: 'var(--muted-fg)' }}
            >
                <div className="flex-1 text-left overflow-hidden relative h-5">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={activeTab.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 top-0 whitespace-nowrap"
                        >
                            $ {activeTab.command}
                        </motion.span>
                    </AnimatePresence>
                </div>
                <button
                    onClick={handleCopy}
                    title={copied ? 'Copied!' : 'Copy to clipboard'}
                    className="bg-transparent border-none cursor-pointer p-1 rounded-md transition-colors duration-200 hover:bg-gray-500/20 flex items-center justify-center shrink-0"
                    style={{ color: copied ? '#22c55e' : 'var(--muted-fg)' }}
                >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                </button>
            </div>
        </motion.div>
    );
};

export const HeroSection = () => {
    return (
        <section className="text-center pt-20 pb-16 px-6 relative flex flex-col items-center overflow-hidden">
            <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-6xl md:!text-[6rem] lg:!text-[3.7rem] font-extrabold tracking-tight leading-tight mb-6"
            >
                Switch Git Identities,{' '}
                <span className="text-red-600 dark:text-red-500">Instantly</span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
                style={{ color: 'var(--muted-fg)' }}
            >
                nvm for Git profiles - manage SSH keys, emails, and signing configs
                across multiple GitHub accounts with a single command.{' '}
                <br />
                <span className="font-semibold text-sm mt-2 block">
                    Works on macOS, Linux, and Windows.
                </span>
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center justify-center gap-4 flex-wrap mb-10"
            >
                <Link
                    to="/docs/Introduction"
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-red-600 font-semibold text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,0,0,0.25)]"
                    style={{ color: '#ffffff', textDecoration: 'none' }}
                >
                    Get Started
                </Link>
                <Link
                    to="https://github.com/mindfiredigital/gpx"
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-transparent font-semibold text-base border transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-500/5"
                    style={{ borderColor: 'var(--card-border)', color: 'var(--ifm-font-color-base)', border: '1px solid var(--card-border)', textDecoration: 'none' }}
                >
                    <StarIcon /> GitHub
                </Link>
            </motion.div>

            <InstallPill />
        </section>
    );
};
