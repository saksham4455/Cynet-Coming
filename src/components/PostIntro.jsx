import { motion } from 'framer-motion';

const PostIntro = () => {
    return (
        <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#000000', position: 'relative' }} className="noise-bg">
            {/* Top Bar */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
                {/* Left Logo */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <svg width="120" height="40" viewBox="0 0 120 40" style={{ stroke: '#EDEDED', fill: 'none' }}>
                        <text x="0" y="30" style={{ fontSize: '1.5rem', fontFamily: 'Courier New, monospace' }} stroke="currentColor" strokeWidth="0.5" fill="none">
                            CYNET
                        </text>
                    </svg>
                </motion.div>

                {/* Right Logo */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <svg width="40" height="40" viewBox="0 0 40 40" style={{ stroke: '#EDEDED', fill: 'none' }}>
                        <circle cx="20" cy="20" r="15" strokeWidth="1" />
                        <circle cx="20" cy="20" r="10" strokeWidth="0.5" opacity="0.5" />
                    </svg>
                </motion.div>
            </div>

            {/* Glitch Lines Background Effect */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        style={{ position: 'absolute', width: '100%', height: '1px', backgroundColor: '#EDEDED', top: `${20 + i * 30}%` }}
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{
                            opacity: [0, 0.05, 0],
                            scaleX: [0, 1, 0]
                        }}
                        transition={{
                            delay: i * 2,
                            duration: 0.3,
                            repeat: Infinity,
                            repeatDelay: 8
                        }}
                    />
                ))}
            </div>

            {/* Main Content Area */}
            <div style={{ paddingTop: '8rem', paddingLeft: '2rem', paddingRight: '2rem', maxWidth: '80rem', margin: '0 auto' }}>
                <motion.div
                    style={{ color: '#EDEDED', textAlign: 'center' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                >
                    <h1 style={{ fontSize: '3.75rem', fontFamily: 'Courier New, monospace', marginBottom: '1rem' }}>WELCOME</h1>
                    <p style={{ color: '#8A8A8A', fontSize: '1.25rem' }}>System initialized successfully</p>
                </motion.div>
            </div>
        </div>
    );
};

export default PostIntro;

