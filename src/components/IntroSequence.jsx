import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundVideo from '../assets/BG.mp4';
import EnigmaLogo from '../assets/Enigma_Logo.svg';
import JimsLogo from '../assets/Jims.png';

// Text Scramble Component
const ScrambleText = ({ text, duration = 1000, delay = 0, className = '', style = {} }) => {
    const [displayText, setDisplayText] = useState('');
    const chars = '!<>-_\\/[]{}—=+*^?#________';

    useEffect(() => {
        let mounted = true;
        const startTime = Date.now() + delay;

        const animate = () => {
            if (!mounted) return;

            const elapsed = Date.now() - startTime;
            if (elapsed < 0) {
                requestAnimationFrame(animate);
                return;
            }

            const progress = Math.min(elapsed / duration, 1);
            const revealedChars = Math.floor(progress * text.length);

            const scrambled = text
                .split('')
                .map((char, i) => {
                    if (char === ' ') return ' ';
                    if (i < revealedChars) return text[i];
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');

            setDisplayText(scrambled);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
        return () => { mounted = false; };
    }, [text, duration, delay]);

    return <span className={className} style={style}>{displayText}</span>;
};


const IntroSequence = ({ onComplete }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [screen, setScreen] = useState(-1); // Start at -1 for loading
    const [terminalText, setTerminalText] = useState('');
    const [loaderProgress, setLoaderProgress] = useState(0);
    const [showCursor, setShowCursor] = useState(false);
    const [showSkip, setShowSkip] = useState(false);
    const [glitchIntensity, setGlitchIntensity] = useState(0);
    const videoRef = useRef(null);
    const containerRef = useRef(null);

    const terminalLines = [
        '> booting cynet core',
        '> loading system modules',
        '> syncing neural layer',
        '> validating observer',
        '> ERROR: UNAUTHORIZED ACCESS DETECTED',
        '> ERROR: SECURITY BREACH IN PROGRESS',
        '> ERROR: SYSTEM OVERRIDE INITIATED',
        '> WARNING: NEURAL LAYER COMPROMISED'
    ];

    // Skip to final screen
    const skipIntro = () => {
        setScreen(2);
    };

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Escape' && screen < 2) {
                skipIntro();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [screen]);

    // Show skip button after 2 seconds
    useEffect(() => {
        const timer = setTimeout(() => setShowSkip(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    // Loading screen - preload assets
    useEffect(() => {
        let progress = 0;
        const loadingInterval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(loadingInterval);
                setTimeout(() => {
                    setIsLoading(false);
                    setScreen(0);
                }, 500);
            }
            setLoadingProgress(Math.min(progress, 100));
        }, 200);

        return () => clearInterval(loadingInterval);
    }, []);

    useEffect(() => {
        if (screen === -1 || isLoading) return;

        // Screen 0: Black void with cursor
        if (screen === 0) {
            setTimeout(() => setShowCursor(true), 300);

            // Screen 1: Terminal boot (after 800ms)
            setTimeout(() => {
                setScreen(1);
                setShowCursor(false);
                let currentLine = 0;
                let currentChar = 0;
                let fullText = '';

                const typeInterval = setInterval(() => {
                    if (currentLine < terminalLines.length) {
                        if (currentChar < terminalLines[currentLine].length) {
                            fullText += terminalLines[currentLine][currentChar];
                            setTerminalText(fullText);
                            currentChar++;

                            // Trigger glitch on ERROR lines
                            if (terminalLines[currentLine].includes('ERROR')) {
                                setGlitchIntensity(Math.random() * 10 + 5);
                                setTimeout(() => setGlitchIntensity(0), 100);
                            }
                        } else {
                            fullText += '\n';
                            setTerminalText(fullText);
                            currentLine++;
                            currentChar = 0;
                        }
                    } else {
                        clearInterval(typeInterval);

                        // Intense glitch on errors
                        setGlitchIntensity(30);
                        setTimeout(() => setGlitchIntensity(0), 400);

                        // Go directly to CYNET reveal (screen 2) and stay there
                        setTimeout(() => {
                            setScreen(2);
                        }, 800);
                    }
                }, 20); // Typing speed
            }, 800);
        }
    }, [screen, isLoading]);

    // Countdown Timer Logic
    const calculateTimeLeft = () => {
        const targetDate = new Date('March 14, 2026 00:00:00').getTime();
        const now = new Date().getTime();
        const difference = targetDate - now;

        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000),
                milliseconds: Math.floor((difference % 1000) / 10)
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        if (screen === 2) {
            const timer = setInterval(() => {
                setTimeLeft(calculateTimeLeft());
            }, 10);
            return () => clearInterval(timer);
        }
    }, [screen]);

    // Programmatically play video on mobile
    useEffect(() => {
        if (screen >= 2 && videoRef.current) {
            // Attempt to play with multiple retries for mobile devices
            const attemptPlay = () => {
                if (videoRef.current) {
                    videoRef.current.play()
                        .then(() => {
                            console.log('Video playing successfully');
                        })
                        .catch(err => {
                            console.log('Video autoplay failed:', err);
                            // Try again after a short delay
                            setTimeout(() => {
                                if (videoRef.current && videoRef.current.paused) {
                                    videoRef.current.play().catch(e => console.log('Retry failed:', e));
                                }
                            }, 500);
                        });
                }
            };

            // Initial attempt
            attemptPlay();

            // Also try on any user interaction
            const handleInteraction = () => {
                if (videoRef.current && videoRef.current.paused) {
                    videoRef.current.play().catch(err => console.log('Play on interaction failed:', err));
                }
            };

            document.addEventListener('touchstart', handleInteraction, { once: true });
            document.addEventListener('click', handleInteraction, { once: true });

            return () => {
                document.removeEventListener('touchstart', handleInteraction);
                document.removeEventListener('click', handleInteraction);
            };
        }
    }, [screen]);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100vh',
                backgroundColor: '#000000',
                overflow: 'hidden',
                transform: glitchIntensity > 0 ? `translate(${Math.random() * glitchIntensity - glitchIntensity / 2}px, ${Math.random() * glitchIntensity - glitchIntensity / 2}px)` : 'none',
                transition: 'transform 0.05s'
            }}
            onClick={() => screen === 3 ? null : skipIntro()} // Tap anywhere to skip (except final screen)
        >
            {/* RGB Split Glitch Overlay */}
            {glitchIntensity > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(90deg, 
                            rgba(255,0,85,${glitchIntensity / 100}) 0%, 
                            transparent 50%, 
                            rgba(0,217,255,${glitchIntensity / 100}) 100%)`,
                        zIndex: 100,
                        pointerEvents: 'none',
                        mixBlendMode: 'screen'
                    }}
                />
            )}

            {/* Skip Button */}
            {showSkip && screen > 0 && screen < 2 && (
                <motion.button
                    style={{
                        position: 'fixed',
                        top: 'clamp(1rem, 3vw, 2rem)',
                        right: 'clamp(1rem, 3vw, 2rem)',
                        padding: 'clamp(0.5rem, 2vw, 1rem) clamp(1rem, 3vw, 2rem)',
                        backgroundColor: 'rgba(0, 217, 255, 0.1)',
                        border: '2px solid #00D9FF',
                        color: '#00D9FF',
                        fontFamily: 'Courier New, monospace',
                        fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                        cursor: 'pointer',
                        zIndex: 1000,
                        backdropFilter: 'blur(10px)',
                        textTransform: 'uppercase',
                        letterSpacing: '2px'
                    }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{
                        backgroundColor: 'rgba(0, 217, 255, 0.2)',
                        scale: 1.05,
                        boxShadow: '0 0 20px rgba(0, 217, 255, 0.8)'
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        skipIntro();
                    }}
                >
                    SKIP [ESC]
                </motion.button>
            )}

            {/* Loading Screen */}
            {isLoading && screen === -1 && (
                <motion.div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2rem',
                        zIndex: 200
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        style={{
                            color: '#00D9FF',
                            fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                            fontFamily: 'Courier New, monospace',
                            letterSpacing: '0.5em'
                        }}
                        animate={{
                            opacity: [1, 0.5, 1],
                            textShadow: [
                                '0 0 10px rgba(0,217,255,0.8)',
                                '0 0 20px rgba(176,38,255,0.6)',
                                '0 0 10px rgba(0,217,255,0.8)'
                            ]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        INITIALIZING
                    </motion.div>

                    <div style={{ width: 'clamp(200px, 60vw, 400px)', position: 'relative' }}>
                        <div style={{
                            width: '100%',
                            height: '4px',
                            backgroundColor: 'rgba(26, 26, 26, 0.6)',
                            borderRadius: '2px',
                            overflow: 'hidden'
                        }}>
                            <motion.div
                                style={{
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #39FF14, #00D9FF, #B026FF)',
                                    boxShadow: '0 0 15px #39FF14',
                                    width: `${loadingProgress}%`
                                }}
                                initial={{ width: 0 }}
                                animate={{ width: `${loadingProgress}%` }}
                            />
                        </div>
                        <motion.div
                            style={{
                                color: '#39FF14',
                                fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                                fontFamily: 'Courier New, monospace',
                                marginTop: '0.5rem',
                                textAlign: 'center',
                                textShadow: '0 0 10px #39FF14'
                            }}
                        >
                            {Math.floor(loadingProgress)}%
                        </motion.div>
                    </div>
                </motion.div>
            )}
            {/* Consistent Background Video across relevant screens */}
            {(screen >= 2) && (
                <div
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', zIndex: 0 }}
                    onClick={() => {
                        // Try to play video on touch for mobile devices
                        if (videoRef.current && videoRef.current.paused) {
                            videoRef.current.play().catch(err => console.log('Play failed:', err));
                        }
                    }}
                >
                    <video
                        ref={videoRef}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        onLoadedMetadata={() => {
                            // Try to play once metadata is loaded
                            if (videoRef.current) {
                                videoRef.current.play().catch(err => console.log('Play after load failed:', err));
                            }
                        }}
                        onCanPlayThrough={() => {
                            // Try to play once video can play through without buffering
                            if (videoRef.current && videoRef.current.paused) {
                                videoRef.current.play().catch(err => console.log('Play on canplaythrough failed:', err));
                            }
                        }}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            backgroundColor: '#000000'
                        }}
                    >
                        <source src={BackgroundVideo} type="video/mp4" />
                    </video>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1 }} />
                </div>
            )}

            {/* CRT & Scanline Overlay - Only on screens 0-1, NOT on CYNET screen */}
            {screen < 2 && (
                <>
                    <div className="scanlines" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50 }} />
                    <div className="crt-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 49 }} />
                </>
            )}

            {/* Floating Binary Particles - Subtle background effect */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            background: Math.random() > 0.5 ? '#39FF14' : Math.random() > 0.5 ? '#00D9FF' : '#B026FF',
                            width: Math.random() * 3 + 'px',
                            height: Math.random() * 3 + 'px',
                        }}
                        animate={{
                            y: [0, Math.random() * 100 - 50],
                            opacity: [0, 0.8, 0],
                        }}
                        transition={{
                            duration: Math.random() * 5 + 3,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 2
                        }}
                    />
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* Screen 0: Black Void */}
                {screen === 0 && (
                    <motion.div
                        key="screen0"
                        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 10 }}
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {showCursor && (
                            <span style={{ color: '#00D9FF', fontSize: '2rem', textShadow: '0 0 10px #00D9FF' }} className="cursor-blink">_</span>
                        )}
                    </motion.div>
                )}

                {/* Screen 1: Terminal Boot */}
                {screen === 1 && (
                    <motion.div
                        key="screen1"
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'flex-start',
                            padding: 'clamp(1.5rem, 3vw, 3rem)',
                            position: 'relative',
                            zIndex: 10,
                            backgroundColor: 'rgba(0, 0, 0, 0.9)'
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Terminal Window Effect */}
                        <div style={{
                            width: '100%',
                            height: '100%',
                            border: '2px solid rgba(0, 217, 255, 0.3)',
                            borderRadius: '8px',
                            padding: 'clamp(1rem, 2vw, 2rem)',
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            boxShadow: '0 0 20px rgba(0, 217, 255, 0.2), inset 0 0 60px rgba(0, 217, 255, 0.05)',
                            overflow: 'auto'
                        }}>
                            {/* Terminal Header */}
                            <div style={{
                                marginBottom: '1rem',
                                paddingBottom: '0.5rem',
                                borderBottom: '1px solid rgba(0, 217, 255, 0.2)',
                                color: '#00D9FF',
                                fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
                                fontFamily: 'Courier New, monospace'
                            }}>
                                root@cynet:~#
                            </div>

                            <pre style={{
                                fontFamily: 'Courier New, monospace',
                                fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
                                lineHeight: '1.6',
                                whiteSpace: 'pre-wrap',
                                margin: 0
                            }}>
                                {terminalText.split('\n').map((line, i) => (
                                    <div key={i} style={{
                                        color: line.includes('ERROR') || line.includes('WARNING') ? '#FF0055' : '#00D9FF',
                                        textShadow: line.includes('ERROR') || line.includes('WARNING') ? '0 0 10px #FF0055' : '0 0 5px #00D9FF',
                                        marginBottom: '0.3rem'
                                    }}>
                                        {line}
                                    </div>
                                ))}
                                <span className="cursor-blink">_</span>
                            </pre>
                        </div>
                    </motion.div>
                )}

                {/* Screen 2: CYNET Reveal with Countdown */}
                {screen === 2 && (
                    <motion.div
                        key="screen2"
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                            zIndex: 10
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {/* Darker overlay for better visibility */}
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.02)', zIndex: 1 }} />

                        {/* JIMS Logo - Left */}
                        <img
                            src={JimsLogo}
                            alt="JIMS Logo"
                            style={{
                                position: 'absolute',
                                top: '0.5rem',
                                left: 'clamp(1rem, 3vw, 2rem)',
                                height: 'clamp(60px, 10vw, 110px)',
                                width: 'auto',
                                opacity: 0.9,
                                filter: 'brightness(1.8)',
                                zIndex: 20
                            }}
                        />

                        {/* Enigma Logo - Right */}
                        <img
                            src={EnigmaLogo}
                            alt="Enigma Logo"
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: 'clamp(1rem, 3vw, 2rem)',
                                height: 'clamp(50px, 7vw, 80px)',
                                width: 'auto',
                                opacity: 0.9,
                                filter: 'brightness(1.8)',
                                zIndex: 20
                            }}
                        />

                        {/* Main Content Container */}
                        <div style={{
                            zIndex: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 'clamp(1.5rem, 5vw, 2.5rem)',
                            textAlign: 'center',
                            width: '100%',
                            maxWidth: '1200px',
                            padding: '0 clamp(1.2rem, 4vw, 2rem)'
                        }}>
                            {/* Save The Date - Small Accent */}
                            <motion.p
                                style={{
                                    color: '#9500ff',
                                    fontSize: 'clamp(1.2rem, 3vw, 2rem)',
                                    fontFamily: 'Courier New, monospace',
                                    letterSpacing: '0.4em',
                                    fontWeight: 'bold',
                                    textShadow: '0 0 12px rgba(157, 0, 255, 0.6)',
                                    textTransform: 'uppercase',
                                    marginBottom: '3rem',
                                    marginTop: '-2rem'
                                }}
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                <ScrambleText text="Save The Date" duration={600} delay={400} />
                            </motion.p>

                            {/* PROTOCOL: CYNET - Main Title with Glitch Effect */}
                            <motion.h1
                                className="glitch-text"
                                style={{
                                    color: '#FFFFFF',
                                    fontSize: 'clamp(3rem, 12vw, 6.5rem)',
                                    fontFamily: "'Luckiest Guy', cursive",
                                    letterSpacing: 'clamp(4px, 2vw, 12px)',
                                    fontWeight: 'normal',
                                    WebkitTextStroke: '2px transparent',
                                    textAlign: 'center',
                                    marginTop: '-2rem',
                                    textShadow: `
                                        3px 3px 0px rgba(255, 0, 85, 1),
                                        -3px -3px 0px rgba(0, 217, 255, 1),
                                        0 0 30px rgba(255, 255, 255, 0.6)
                                    `,
                                    filter: 'drop-shadow(0 0 40px rgba(0, 217, 255, 0.7))',
                                    lineHeight: 1.1,
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    WebkitTapHighlightColor: 'transparent'
                                }}
                                initial={{ opacity: 0, y: 50, scale: 0.5 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: [1, 1.08, 0.98, 1.05, 1],
                                    textShadow: [
                                        '3px 3px 0px rgba(255, 0, 85, 1), -3px -3px 0px rgba(0, 217, 255, 1), 0 0 30px rgba(255, 255, 255, 0.6)',
                                        '5px 0px 0px rgba(176, 38, 255, 1), -5px 0px 0px rgba(0, 217, 255, 1), 0 0 35px rgba(255, 255, 255, 0.7)',
                                        '3px 3px 0px rgba(255, 0, 85, 1), -3px -3px 0px rgba(0, 217, 255, 1), 0 0 30px rgba(255, 255, 255, 0.6)',
                                        '0px 5px 0px rgba(176, 38, 255, 1), 0px -5px 0px rgba(57, 255, 20, 1), 0 0 35px rgba(255, 255, 255, 0.7)',
                                        '3px 3px 0px rgba(255, 0, 85, 1), -3px -3px 0px rgba(0, 217, 255, 1), 0 0 30px rgba(255, 255, 255, 0.6)',
                                    ],
                                    filter: [
                                        'drop-shadow(0 0 40px rgba(0, 217, 255, 0.7))',
                                        'drop-shadow(0 0 50px rgba(176, 38, 255, 0.8))',
                                        'drop-shadow(0 0 40px rgba(0, 217, 255, 0.7))',
                                        'drop-shadow(0 0 50px rgba(57, 255, 20, 0.8))',
                                        'drop-shadow(0 0 40px rgba(0, 217, 255, 0.7))',
                                    ],
                                    skewX: [0, 3, -3, 2, -2, 0],
                                    x: [0, 2, -2, 1, -1, 0]
                                }}
                                transition={{
                                    delay: 0.4,
                                    duration: 0.6,
                                    scale: {
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatDelay: 0.5,
                                        ease: "easeInOut"
                                    },
                                    textShadow: {
                                        duration: 0.4,
                                        repeat: Infinity,
                                        repeatDelay: 0.3,
                                    },
                                    filter: {
                                        duration: 0.4,
                                        repeat: Infinity,
                                        repeatDelay: 0.3,
                                    },
                                    skewX: {
                                        duration: 0.5,
                                        repeat: Infinity,
                                        repeatDelay: 0.8,
                                    },
                                    x: {
                                        duration: 0.3,
                                        repeat: Infinity,
                                        repeatDelay: 1,
                                    }
                                }}
                                whileHover={{
                                    scale: 1.1,
                                    textShadow: '0 0 30px #39FF14, 5px 5px 0px rgba(57, 255, 20, 0.9), -5px -5px 0px rgba(57, 255, 20, 0.9)',
                                    filter: 'drop-shadow(0 0 60px rgba(57, 255, 20, 0.8))',
                                    skewX: [0, -3, 3, -3, 0],
                                    transition: { duration: 0.3 }
                                }}
                                whileTap={{
                                    scale: 0.95,
                                    textShadow: '0 0 30px #FF0055, 8px 0px 0px rgba(255, 0, 85, 0.9), -8px 0px 0px rgba(176, 38, 255, 0.9)',
                                    filter: 'drop-shadow(0 0 60px rgba(255, 0, 85, 0.8))',
                                    rotate: [0, -5, 5, -5, 0],
                                    transition: { duration: 0.5 }
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setGlitchIntensity(20);
                                    setTimeout(() => setGlitchIntensity(0), 300);
                                }}
                            >
                                CYNET
                                <br />
                                
                            </motion.h1>
                            <span style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)' }}>
                                    The Unseen face Of Technological Innovation
                                </span>

                            {/* Date */}
                            <motion.div
                                style={{
                                    color: '#FF0000',
                                    fontSize: 'clamp(2rem, 4.5vw, 2.3rem)',
                                    fontFamily: 'Courier New, monospace',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    textShadow: '0 0 12px rgba(255, 0, 0, 0.4)',
                                    marginTop: '-0.5rem'
                                }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    textShadow: [
                                        '0 0 12px rgba(192, 132, 252, 0.4)',
                                        '0 0 16px rgba(192, 132, 252, 0.5)',
                                        '0 0 12px rgba(192, 132, 252, 0.4)'
                                    ]
                                }}
                                transition={{
                                    delay: 0.8,
                                    duration: 0.8,
                                    textShadow: {
                                        duration: 2.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }
                                }}
                                whileHover={{
                                    scale: 1.05,
                                    textShadow: '0 0 20px rgba(192, 132, 252, 0.6)'
                                }}
                            >
                                <ScrambleText text="14 MARCH 2026" duration={600} delay={1000} />
                            </motion.div>

                            {/* Countdown with Glitch Effect */}
                            <motion.div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginTop: 'clamp(1rem, 3vw, 2rem)'
                                }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <motion.div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(4, 1fr)',
                                        backdropFilter: 'blur(14px)',
                                        background: 'linear-gradient(145deg, rgba(0,255,150,0.08), rgba(0,255,150,0.02))',
                                        borderRadius: '20px',
                                        border: '1px solid rgba(0,255,150,0.3)',
                                        overflow: 'hidden',
                                        minWidth: 'clamp(280px, 60vw, 520px)'
                                    }}
                                    animate={{
                                        boxShadow: [
                                            '0 0 50px rgba(0,255,150,0.7), inset 0 0 50px rgba(0,255,150,0.15), 3px 3px 0px rgba(255,0,85,0.7), -3px -3px 0px rgba(0,217,255,0.7)',
                                            '0 0 70px rgba(0,255,150,0.8), inset 0 0 70px rgba(0,255,150,0.2), 5px 0px 0px rgba(255,0,85,0.8), -5px 0px 0px rgba(0,217,255,0.8)',
                                            '0 0 50px rgba(0,255,150,0.7), inset 0 0 50px rgba(0,255,150,0.15), 0px 5px 0px rgba(176,38,255,0.8), 0px -5px 0px rgba(57,255,20,0.8)',
                                            '0 0 70px rgba(0,255,150,0.8), inset 0 0 70px rgba(0,255,150,0.2), -4px 4px 0px rgba(0,217,255,0.8), 4px -4px 0px rgba(255,0,85,0.8)',
                                            '0 0 50px rgba(0,255,150,0.7), inset 0 0 50px rgba(0,255,150,0.15), 3px 3px 0px rgba(255,0,85,0.7), -3px -3px 0px rgba(0,217,255,0.7)'
                                        ],
                                        x: [0, 1, -1, 0.5, -0.5, 0],
                                        y: [0, -0.5, 0.5, -1, 1, 0]
                                    }}
                                    transition={{
                                        boxShadow: {
                                            duration: 5,
                                            repeat: Infinity,
                                            ease: "linear"
                                        },
                                        x: {
                                            duration: 0.9,
                                            repeat: Infinity,
                                            ease: "linear"
                                        },
                                        y: {
                                            duration: 0.9,
                                            repeat: Infinity,
                                            ease: "linear"
                                        }
                                    }}
                                >
                                    {[
                                        { value: timeLeft.days || 0, label: 'DAYS' },
                                        { value: timeLeft.hours || 0, label: 'HRS' },
                                        { value: timeLeft.minutes || 0, label: 'MIN' },
                                        { value: timeLeft.seconds || 0, label: 'SEC' }
                                    ].map((item, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                padding: 'clamp(0.6rem, 3vw, 1rem)',
                                                textAlign: 'center',
                                                borderRight: index !== 3
                                                    ? '1px solid rgba(0,255,150,0.2)'
                                                    : 'none'
                                            }}
                                        >
                                            <motion.div
                                                key={item.value}
                                                initial={{ y: 5, opacity: 0 }}
                                                animate={{ 
                                                    y: 0, 
                                                    opacity: 1,
                                                    textShadow: [
                                                        '0 0 35px rgba(57,255,20,1), 2px 2px 0px rgba(255,0,85,0.7), -2px -2px 0px rgba(0,217,255,0.7)',
                                                        '0 0 40px rgba(57,255,20,1), 3px 0px 0px rgba(255,0,85,0.8), -3px 0px 0px rgba(0,217,255,0.8)',
                                                        '0 0 35px rgba(57,255,20,1), 0px 3px 0px rgba(176,38,255,0.8), 0px -3px 0px rgba(57,255,20,0.8)',
                                                        '0 0 40px rgba(57,255,20,1), -2px 2px 0px rgba(0,217,255,0.8), 2px -2px 0px rgba(255,0,85,0.8)',
                                                        '0 0 35px rgba(57,255,20,1), 2px 2px 0px rgba(255,0,85,0.7), -2px -2px 0px rgba(0,217,255,0.7)'
                                                    ],
                                                    filter: [
                                                        'blur(0px)',
                                                        'blur(0.3px)',
                                                        'blur(0px)',
                                                        'blur(0.2px)',
                                                        'blur(0px)'
                                                    ],
                                                    x: [0, 0.5, -0.5, 0.3, -0.3, 0]
                                                }}
                                                transition={{ 
                                                    duration: 0.4,
                                                    textShadow: {
                                                        duration: 1.5,
                                                        repeat: Infinity,
                                                        ease: "linear"
                                                    },
                                                    filter: {
                                                        duration: 1.2,
                                                        repeat: Infinity,
                                                        ease: "linear"
                                                    },
                                                    x: {
                                                        duration: 0.9,
                                                        repeat: Infinity,
                                                        ease: "linear"
                                                    }
                                                }}
                                                style={{
                                                    fontSize: 'clamp(2rem, 6vw, 4rem)',
                                                    fontFamily: "'Share Tech Mono', monospace",
                                                    color: '#39FF14',
                                                    letterSpacing: '0.05em'
                                                }}
                                            >
                                                {String(item.value).padStart(2, '0')}
                                            </motion.div>

                                            <div style={{
                                                fontSize: 'clamp(0.6rem, 1.5vw, 0.8rem)',
                                                fontFamily: 'Courier New, monospace',
                                                letterSpacing: '0.3em',
                                                marginTop: '0.6rem',
                                                opacity: 0.7,
                                                color: '#E0E0E0'
                                            }}>
                                                {item.label}
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            </motion.div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default IntroSequence;

