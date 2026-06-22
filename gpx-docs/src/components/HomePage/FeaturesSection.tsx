import { motion } from 'framer-motion';
import { features } from '../../constants/features';

export const FeaturesSection = () => {
    return (
        <section
            className="py-16 px-6"
            style={{ background: 'var(--section-bg, rgba(255,0,0,0.03))', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)' }}
        >
            <div className="text-center max-w-2xl mx-auto mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.4 }}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full"
                    style={{
                        color: 'var(--muted-fg)',
                        background: 'rgba(255, 0, 0, 0.06)',
                        border: '1px solid rgba(255, 0, 0, 0.12)',
                    }}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    Why developers love GPX
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                    className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4"
                >
                    Built for{' '}
                    <span className="text-red-600 dark:text-red-500">developers</span> who
                    juggle multiple Git accounts
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="text-lg leading-relaxed"
                    style={{ color: 'var(--muted-fg)' }}
                >
                    Stop mixing up commits. GPX keeps your work, personal, and client
                    profiles cleanly separated.
                </motion.p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
                {features.map((f, i) => (
                    <motion.div
                        key={f.title}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.4, delay: i * 0.08 }}
                        whileHover={{ y: -6 }}
                        className="relative rounded-2xl p-8 overflow-hidden transition-shadow duration-300 hover:shadow-lg"
                        style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
                    >
                        <div className="flex gap-5 items-center">
                            <span className="flex items-center justify-center w-10 h-10 rounded-lg mb-4 text-xl"
                                style={{ background: 'rgba(255, 0, 0, 0.08)' }}
                            >
                                {f.icon}
                            </span>
                            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-fg)' }}>
                            {f.desc}
                        </p>
                        <div
                            className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-2xl"
                            style={{ background: 'linear-gradient(90deg, var(--ifm-color-primary), transparent)' }}
                        />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}