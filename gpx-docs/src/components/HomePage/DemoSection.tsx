import React from 'react';
import { motion } from 'framer-motion';
import { demoHighlights } from '../../constants/demoHighlights';

export const DemoSection = () => {
    return (
        <section className="py-16 px-6 flex flex-col items-center gap-3" style={{ borderTop: '1px solid var(--card-border)' }}>
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5 }}
                className="text-2xl md:text-3xl font-bold tracking-tight leading-tight mb-2"
            >
                Setup your <span className="text-red-600 dark:text-red-500 uppercase">environment</span>
            </motion.h2>
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6 }}
                    className="rounded-2xl overflow-hidden shadow-2xl"
                    style={{ border: '1px solid var(--card-border)' }}
                >
                    <div className="w-full bg-gray-800/80 backdrop-blur-md flex items-center px-4 py-2.5 gap-2 border-b border-gray-700/50">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>
                        <span className="ml-3 text-xs font-mono text-gray-400">
                            gpx --quick-start
                        </span>
                    </div>
                    <video
                        // @ts-ignore
                        src={require('@site/static/img/gpx-quick-start.mp4').default}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-auto block bg-black"
                    />
                </motion.div>

                <div className="space-y-8">
                    {demoHighlights.map((h, i) => (
                        <motion.div
                            key={h.title}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.4, delay: i * 0.08 }}
                            className="flex gap-4 items-center p-4 rounded-xl transition-colors duration-200 hover:bg-gray-500/5"
                            style={{ border: '1px solid var(--card-border)' }}
                        >
                            <span
                                className="flex items-center justify-center w-10 h-10 rounded-lg text-lg shrink-0"
                                style={{ background: 'rgba(255, 0, 0, 0.08)' }}
                            >
                                {h.icon}
                            </span>
                            <div>
                                <h3 className="text-base font-semibold mb-1">{h.title}</h3>
                                <p className="text-sm leading-relaxed m-0" style={{ color: 'var(--muted-fg)' }}>
                                    {h.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
