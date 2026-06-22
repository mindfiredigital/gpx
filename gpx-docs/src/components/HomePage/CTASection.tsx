import Link from "@docusaurus/Link";
import { motion } from "framer-motion";

export const CTASection = () => {
    return (
        <section className="py-16 px-6 flex justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-3xl px-8 py-12 rounded-3xl text-center overflow-hidden"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
            >
                <div
                    className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse, rgba(255, 0, 0, 0.08), transparent 70%)' }}
                />
                <h2 className="text-2xl md:text-3xl font-bold mb-4 relative">
                    Ready to{' '}
                    <span className="text-red-600 dark:text-red-500">simplify</span> your
                    Git workflow?
                </h2>
                <p className="text-lg mb-8 relative" style={{ color: 'var(--muted-fg)' }}>
                    Join developers who manage multiple Git identities without the
                    headache.
                </p>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="inline-block">
                    <Link
                        to="/docs/Introduction"
                        className="relative inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-red-600 font-semibold text-base transition-all duration-300 hover:shadow-[0_8px_24px_rgba(255,0,0,0.25)]"
                        style={{ color: '#ffffff', textDecoration: 'none' }}
                    >
                        Get Started
                    </Link>
                </motion.div>
            </motion.div>
        </section>
    );
}