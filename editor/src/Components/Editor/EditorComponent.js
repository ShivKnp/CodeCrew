import React, { useRef, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import MonacoEditor from "react-monaco-editor";
import { Resizable } from "re-resizable";
import { Dropdown, Button, Space, Tooltip, Menu } from 'antd';
import {
    FontSizeOutlined, FontColorsOutlined, BgColorsOutlined,
    CaretDownOutlined, CodeOutlined, TeamOutlined,
} from '@ant-design/icons';
import styles from "./main.module.css";
import SideDrawer from "../SideDrawer/SideDrawer";
import VideoChat from "../../Containers/VideoChat";
import ParticipantsDrawer from "../ParticipantsDrawer/ParticipantsDrawer";
import VideoChatComponent from "../VideoChat/videoChatComponent";

const EditorComponent = (props) => {
    const { lang, code, input, output, runCodeDisabled, readOnly, handleLang, handleRun, handleInput, theme, fontSize, toggleTheme, increaseFont, decreaseFont, editorDidMount, editorOnChange } = props;

    const [userName, setUserName] = useState(() => sessionStorage.getItem('codecrew-username') || '');
    const history = useHistory();
    const { id } = useParams();

    useEffect(() => {
        if (!userName) {
            history.replace(`/lobby/${id}`);
        }
    }, [userName, id, history]);

    const [videoChat, setVideoChat] = useState(true);
    const [peers, setPeers] = useState(new Map());
    const [localStream, setLocalStream] = useState(null);
    const [pinnedPeerId, setPinnedPeerId] = useState(null);
    const [pinnedStreamType, setPinnedStreamType] = useState('webcam');
    const [participantsDrawerVisible, setParticipantsDrawerVisible] = useState(false);
    const [isSelfPinned, setIsSelfPinned] = useState(false);

    const editorRef = useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
    const [fontFamily, setFontFamily] = useState('Consolas');

    const handlePinPeer = (peerId, streamType = 'webcam') => {
        if (isSelfPinned) setIsSelfPinned(false);
        setPinnedPeerId(prev => (prev === peerId && pinnedStreamType === streamType ? null : peerId));
        setPinnedStreamType(streamType);
    };

    const handleSelfPin = () => {
        if (pinnedPeerId) setPinnedPeerId(null);
        setIsSelfPinned(prev => !prev);
    };

    const handleEndCallAndLeave = () => {
        sessionStorage.removeItem('codecrew-username');
        sessionStorage.removeItem('codecrew-mic-on');
        sessionStorage.removeItem('codecrew-camera-on');
        history.push('/');
    };

    const getPinnedPeer = () => {
        if (isSelfPinned) {
            return { stream: localStream, userName: `${userName} (You)` };
        }
        if (pinnedPeerId && peers.has(pinnedPeerId)) {
            return peers.get(pinnedPeerId);
        }
        const firstPeerId = Array.from(peers.keys())[0];
        return firstPeerId ? peers.get(firstPeerId) : null;
    }

    const pinnedPeer = getPinnedPeer();
    const pinnedStream = pinnedPeer ?
        (pinnedStreamType === 'screen' ? pinnedPeer.screenStream : pinnedPeer.stream)
        : null;

    const handleToggleParticipantsDrawer = () => {
        if (videoChat) {
            setParticipantsDrawerVisible(prev => !prev);
        }
    };

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= 900);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        if (window.monaco) {
            window.monaco.editor.defineTheme('dracula', {
                base: 'vs-dark',
                inherit: true,
                rules: [
                    { token: '', foreground: 'f8f8f2', background: '282a36' },
                    { token: 'keyword', foreground: 'ff79c6' },
                    { token: 'number', foreground: 'bd93f9' },
                    { token: 'string', foreground: 'f1fa8c' },
                    { token: 'comment', foreground: '6272a4' }
                ],
                colors: { 'editor.background': '#282a36' }
            });
        }
    }, []);

    const lightThemes = ['vs', 'light', 'github', 'solarized-light'];
    const isLight = lightThemes.includes(theme);

    const themes = [
        { name: 'Dracula', value: 'dracula' }, { name: 'Dark', value: 'vs-dark' },
        { name: 'Light', value: 'vs' }, { name: 'High Contrast', value: 'hc-black' },
    ];
    const fonts = ['Fira Code', 'Consolas', 'Courier New'];
    const fontSizes = [10, 12, 14, 16, 18, 20, 22, 24];

    const editorOptions = {
        selectOnLineNumbers: true, minimap: { enabled: false }, readOnly,
        fontSize: fontSize, fontFamily: fontFamily, theme: theme,
        automaticLayout: true, lineHeight: 24, wordWrap: 'on',
        scrollBeyondLastLine: false, renderWhitespace: 'selection',
        quickSuggestions: false, suggestOnTriggerCharacters: false
    };

    const themeMenu = (
        <Menu>
            {themes.map(t => (
                <Menu.Item key={t.value} onClick={() => toggleTheme(t.value)}>{t.name}</Menu.Item>
            ))}
        </Menu>
    );
    const fontMenu = (
        <Menu>
            {fonts.map(f => (
                <Menu.Item key={f} onClick={() => setFontFamily(f)}>{f}</Menu.Item>
            ))}
        </Menu>
    );
    const fontSizeMenu = (
        <Menu>
            {fontSizes.map(s => (
                <Menu.Item key={s} onClick={() => increaseFont(s)}>{s}px</Menu.Item>
            ))}
        </Menu>
    );

    const renderControlBar = () => (
        <div className={`${styles.controlBar} ${isLight ? styles.lightControlBar : ''}`}>
            <Space size="middle">
                <Tooltip title={videoChat ? "Show Participants" : "Start video call to see participants"}>
                    <Button
                        type="text"
                        icon={<TeamOutlined />}
                        onClick={handleToggleParticipantsDrawer}
                        className={styles.controlButton}
                        disabled={!videoChat}
                    />
                </Tooltip>
                <CodeOutlined style={{ fontSize: 18 }} />
                <Dropdown overlay={themeMenu} trigger={['click']}>
                    <Button type="text" className={styles.controlButton}>
                        <Space><BgColorsOutlined /> {themes.find(t => t.value === theme)?.name || 'Theme'} <CaretDownOutlined /></Space>
                    </Button>
                </Dropdown>
                <Dropdown overlay={fontMenu} trigger={['click']}>
                    <Button type="text" className={styles.controlButton}>
                        <Space><FontColorsOutlined /> {fontFamily} <CaretDownOutlined /></Space>
                    </Button>
                </Dropdown>
                <Dropdown overlay={fontSizeMenu} trigger={['click']}>
                    <Button type="text" className={styles.controlButton}>
                        <Space><FontSizeOutlined /> {fontSize}px <CaretDownOutlined /></Space>
                    </Button>
                </Dropdown>
                <Tooltip title="Decrease font size"><Button type="text" icon={<span style={{ fontWeight: 'bold' }}>A-</span>} onClick={() => decreaseFont()} className={styles.controlButton} /></Tooltip>
                <Tooltip title="Increase font size"><Button type="text" icon={<span style={{ fontWeight: 'bold' }}>A+</span>} onClick={() => increaseFont()} className={styles.controlButton} /></Tooltip>
            </Space>
        </div>
    );

    const resizableProps = isMobile
        ? { defaultSize: { width: '100%', height: '100%' }, minWidth: '100%', maxWidth: '100%', enable: { right: false } }
        : { defaultSize: { width: '70%', height: '100%' }, minWidth: '50%', maxWidth: '85%', enable: { right: true } };

    if (!userName) {
        return null;
    }

    return (
        <div className={styles.container}>
            {videoChat && userName && (
                <>
                    <VideoChat
                    userName={userName}
                    onPeersUpdate={setPeers}
                    onLocalStream={setLocalStream}
                    roomId={id} // ✅ ADD THIS PROP
                />
                    <ParticipantsDrawer
                        visible={participantsDrawerVisible}
                        onClose={() => setParticipantsDrawerVisible(false)}
                        localStream={localStream}
                        userName={userName}
                        peers={peers}
                        pinnedPeerId={pinnedPeerId}
                        pinnedStreamType={pinnedStreamType}
                        handlePinPeer={handlePinPeer}
                        theme={theme}
                        zIndex={9999}
                        isSelfPinned={isSelfPinned}
                        handleSelfPin={handleSelfPin}
                    />
                </>
            )}

            <div className={styles.mainContent}>
                <Resizable
                    {...resizableProps}
                    className={`${styles.resizableEditor} ${isLight ? styles.lightResizable : ''}`}
                    onResize={() => editorRef.current?.layout()}
                >
                    <div className={styles.editorWrapper}>
                        {renderControlBar()}
                        <div className={styles.editorContainer}>
                            <MonacoEditor
                                language={lang}
                                theme={theme}
                                value={code}
                                options={editorOptions}
                                editorDidMount={(editor, monaco) => {
                                    editorRef.current = editor;
                                    if (editorDidMount) editorDidMount(editor, monaco);
                                }}
                                onChange={editorOnChange}
                            />
                        </div>

                        {videoChat && userName && (
                            <VideoChatComponent
                                localStream={localStream}
                                pinnedStream={pinnedStream}
                                pinnedPeer={pinnedPeer}
                                handleVideoChat={handleEndCallAndLeave}
                                theme={theme}
                                pinnedStreamType={pinnedStreamType}
                            />
                        )}
                    </div>
                </Resizable>
                <div className={styles.sidebar}>
                    <SideDrawer
                        input={input}
                        output={output}
                        runCodeDisabled={runCodeDisabled}
                        lang={lang}
                        handleLang={handleLang}
                        handleRun={handleRun}
                        handleInput={handleInput}
                        theme={theme}
                        participantsDrawerVisible={participantsDrawerVisible}
                    />
                </div>
            </div>
        </div>
    );
};

export default EditorComponent;