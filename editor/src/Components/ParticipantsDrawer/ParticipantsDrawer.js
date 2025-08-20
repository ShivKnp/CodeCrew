import React, { useState, useEffect } from 'react';
import { Button, Drawer } from 'antd';
import { PushpinOutlined } from '@ant-design/icons';
import styles from './main.module.css';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

const ParticipantsDrawer = ({
    visible,
    onClose,
    localStream,
    userName,
    peers,
    pinnedPeerId,
    pinnedStreamType,
    handlePinPeer,
    theme,
    isSelfPinned,
    handleSelfPin,
}) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const lightThemes = ['vs', 'light', 'github', 'solarized-light'];
    const isLight = lightThemes.includes(theme);

    const renderParticipant = ({ id, userName: name, stream, screenStream, micOn, cameraOn }, isLocal = false, streamType = "webcam") => {
        const cardId = `${id}-${streamType}`;
        const isPinned = isLocal ? isSelfPinned : (pinnedPeerId === id && pinnedStreamType === streamType);

        // Prefer explicit metadata flags if present (safer and more reliable). Fall back to stream track checks.
        const isMicEnabled = typeof micOn === 'boolean'
            ? micOn
            : (stream?.getAudioTracks()?.some(track => track.enabled) ?? false);

        const isCameraEnabled = typeof cameraOn === 'boolean'
            ? cameraOn
            : (stream?.getVideoTracks()?.some(track => track.enabled) ?? false);

        const actualStream = streamType === 'screen' ? screenStream : stream;

        return (
            <div key={cardId} className={styles.participantCard}>
                <video
                    className={styles.participantVideo}
                    ref={(video) => { if (video && actualStream) video.srcObject = actualStream; }}
                    autoPlay
                    playsInline
                    muted={isLocal}
                />

                <div className={styles.participantStatusIcons}>
                    {isCameraEnabled ? <FaVideo size={14} /> : <FaVideoSlash size={14} color="red" />}
                    {isMicEnabled ? <FaMicrophone size={14} /> : <FaMicrophoneSlash size={14} color="red" />}
                </div>

                <div className={styles.participantOverlay}>
                    <span className={styles.participantName}>
                        {name} {streamType === "screen" && "(Screen)"}
                    </span>
                    <Button
                        type={isPinned ? "primary" : "default"}
                        shape="circle"
                        icon={<PushpinOutlined />}
                        onClick={() => isLocal ? handleSelfPin() : handlePinPeer(id, streamType)}
                        className={styles.pinButton}
                        title={`Pin ${streamType}`}
                    />
                </div>
            </div>
        );
    };

    // Build a tiny local peer object for rendering consistency
    const localPeerObj = {
        id: 'local',
        userName: `${userName} (You)`,
        stream: localStream,
        screenStream: null,
        micOn: undefined,
        cameraOn: undefined
    };

    return (
        <Drawer
            title={`Participants (${peers.size + 1})`}
            placement={isMobile ? 'bottom' : 'left'}
            onClose={onClose}
            visible={visible}
            mask={true}
            height={isMobile ? '60%' : 'auto'}
            className={`${styles.drawer} ${isLight ? styles.lightTheme : styles.darkTheme}`} 
        >
            <div className={styles.participantList}>
                {localStream && renderParticipant(localPeerObj, true, 'webcam')}

                {Array.from(peers.entries()).map(([id, peer]) => (
                    <React.Fragment key={id}>
                        {peer.stream && renderParticipant({ ...peer, id }, false, 'webcam')}
                        {peer.screenStream && renderParticipant({ ...peer, id }, false, 'screen')}
                    </React.Fragment>
                ))}
            </div>
        </Drawer>
    );
};

export default ParticipantsDrawer;
