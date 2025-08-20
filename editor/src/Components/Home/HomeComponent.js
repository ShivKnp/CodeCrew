import React from "react";
import { Link } from "react-router-dom";
import styles from "./main.module.css";
import { FiCode, FiUsers, FiVideo, FiShare2 } from "react-icons/fi";
import { Button } from "antd";
import { ReactComponent as GithubIcon } from "./github.svg";

const GITHUB_URL = "https://github.com/ShivKnp"; // <-- replace with your repo URL

const features = [
    {
        icon: <FiCode size={20} />,
        title: "Live Code Editor",
        desc: "Real-time Monaco editor with shared cursors, OT-backed consistency and syntax highlighting."
    },
    {
        icon: <FiVideo size={20} />,
        title: "Integrated Video",
        desc: "Built-in WebRTC video for seamless pair programming without leaving the editor."
    },
    {
        icon: <FiUsers size={20} />,
        title: "Pair Programming",
        desc: "Invite collaborators instantly using a unique URL — private by default."
    },
    {
        icon: <FiShare2 size={20} />,
        title: "Share & Save",
        desc: "Share session links or save snapshots for later review and debugging."
    }
];

const HomeComponent = ({ createId, showJoinModal }) => {
    return (
        <div className={styles.homeContainer}>
            <header className={styles.nav}>
                <div className={styles.logo}>
                    <div className={styles.logoMark}>CC</div>
                    <div className={styles.logoText}>CodeCrew</div>
                </div>

                <nav className={styles.navActions}>
                    <a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="CodeCrew GitHub">
                        <Button
                            size="middle"
                            shape="round"
                            className={styles.githubBtn}
                            icon={<GithubIcon className={styles.githubIcon} />}
                        >
                            GitHub
                        </Button>
                    </a>

                    <Link to={`/lobby/${createId()}`}>
                        <Button size="middle" shape="round" className={styles.primaryNavBtn}>
                            Start a session
                        </Button>
                    </Link>
                </nav>
            </header>

            <main className={styles.heroSection}>
                <div className={styles.heroLeft}>
                    <h1 className={styles.title}>Collaborative coding — realtime, simple.</h1>
                    <p className={styles.subtitle}>
                        CodeCrew is a collaborative code-pair platform for interviews, teaching and remote pair-programming.
                        It combines a shared Monaco editor (OT-backed), built-in WebRTC video, and one-click sharing.
                        Languages supported: <strong>C++, Java, Python 3</strong>.
                    </p>

                    <div className={styles.ctaRow}>
                        <Link to={`/lobby/${createId()}`}>
                            <Button size="large" shape="round" className={styles.ctaSecondary}>
                                Start new session
                            </Button>
                        </Link>

                        <Button size="large" shape="round" className={styles.ctaSecondary} onClick={showJoinModal}>
                            Join a session
                        </Button>
                    </div>

                    <div className={styles.quickStats}>
                        <div className={styles.stat}>
                            <div className={styles.statNum}>Realtime</div>
                            <div className={styles.statLabel}>Operational Transformation</div>
                        </div>
                        <div className={styles.stat}>
                            <div className={styles.statNum}>C++, Java, Python</div>
                            <div className={styles.statLabel}>Languages</div>
                        </div>
                        <div className={styles.stat}>
                            <div className={styles.statNum}>WebRTC</div>
                            <div className={styles.statLabel}>Video Calling</div>
                        </div>
                    </div>
                </div>

                <div className={styles.heroRight} aria-hidden>
                    <div className={styles.codeMock}>
                        <div className={styles.codeHeader}>
                            <div className={styles.dot} style={{ background: '#ff5f56' }} />
                            <div className={styles.dot} style={{ background: '#ffbd2e' }} />
                            <div className={styles.dot} style={{ background: '#27c93f' }} />
                        </div>

                        <pre className={styles.codeBlock}>
{`// Try CodeCrew — share & code together
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("CodeCrew"));`}
                        </pre>
                    </div>
                </div>
            </main>

            <section className={styles.featuresSection}>
                {features.map((f, i) => (
                    <div className={styles.featureCard} key={i}>
                        <div className={styles.featureIcon}>{f.icon}</div>
                        <h3>{f.title}</h3>
                        <p>{f.desc}</p>
                    </div>
                ))}
            </section>

            <section className={styles.infoSection}>
                <div className={styles.infoCard}>
                    <h3><b>How real-time editing works</b></h3>
                    <p>
                        CodeCrew uses Operational Transformation (OT) to keep documents consistent when multiple users edit
                        simultaneously. The application uses <strong>ShareDB</strong> with the <strong>json0</strong> OT type,
                        plus string-binding helpers to sync Monaco/textarea content in real time.
                    </p>

                    <h4>Video calling</h4>
                    <p>
                        Video is powered by native WebRTC APIs; a STUN server is used to discover public IPs and a TURN
                        server is available to relay traffic if direct peer-to-peer connection fails.
                    </p>

                    <h4>Completed features</h4>
                    <ul className={styles.bullets}>
                        <li>Real time editing (Monaco + shared cursors)</li>
                        <li>Run code on custom test cases (C++, Java, Python)</li>
                        <li>Private sessions via unique URL</li>
                        <li>Built-in video calling</li>
                        <li>Rich presence (remote cursor highlights)</li>
                    </ul>
                </div>

                <div className={styles.infoCard}>
                    <h3><b>Supported Languages</b></h3>
                    <div className={styles.langGrid}>
                        <div className={styles.lang}>C++</div>
                        <div className={styles.lang}>Java</div>
                        <div className={styles.lang}>Python 3</div>
                    </div>

                    <h3 style={{ marginTop: 20 }}>Roadmap</h3>
                    <ul className={styles.bullets}>
                        <li>Support for more languages and runtimes</li>
                        <li>Proctoring & session analytics</li>
                    </ul>
                </div>
            </section>

            <footer className={styles.footer}>
                <div className={styles.footerLeft}>
                    <div className={styles.brandSmall}>CodeCrew</div>
                    <div className={styles.meta}>Built with React • Node • WebRTC • ShareDB • Docker</div>
                </div>

                <div className={styles.footerRight}>
                    <div className={styles.madeWith}>Made with <span style={{ color: '#ff4d6d' }}>❤</span> by Shivansh Tiwari and Team</div>
                    <div className={styles.copy}> {new Date().getFullYear()} CodeCrew</div>
                </div>
            </footer>
        </div>
    );
};

export default HomeComponent;
