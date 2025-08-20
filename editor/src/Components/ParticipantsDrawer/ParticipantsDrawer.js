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

    const renderParticipant = (id, name, stream, isLocal, streamType = "webcam") => {
    const cardId = `${id}-${streamType}`;
    const isPinned = isLocal ? isSelfPinned : (pinnedPeerId === id && pinnedStreamType === streamType);

    // ✅ Check mic/camera status
    const isMicOn = stream?.getAudioTracks()?.some(track => track.enabled) ?? false;
    const isCameraOn = stream?.getVideoTracks()?.some(track => track.enabled) ?? false;

    return (
        <div key={cardId} className={styles.participantCard}>
  <video
    className={styles.participantVideo}
    ref={(video) => { if (video && stream) video.srcObject = stream; }}
    autoPlay
    playsInline
    muted={isLocal}
  />
  
  {/* ✅ Top-right mic/camera icons */}
  <div className={styles.participantStatusIcons}>
    {isCameraOn ? <FaVideo size={14} /> : <FaVideoSlash size={14} color="red" />}
    {isMicOn ? <FaMicrophone size={14} /> : <FaMicrophoneSlash size={14} color="red" />}
  </div>

  {/* ✅ Bottom overlay for name + pin */}
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
                {localStream && renderParticipant('local', `${userName} (You)`, localStream, true, 'webcam')}
                
                {Array.from(peers.entries()).map(([id, peer]) => (
                    <React.Fragment key={id}>
                        {peer.stream && renderParticipant(id, peer.userName, peer.stream, false, 'webcam')}
                        {peer.screenStream && renderParticipant(id, peer.userName, peer.screenStream, false, 'screen')}
                    </React.Fragment>
                ))}
            </div>
        </Drawer>
    );
};

export default ParticipantsDrawer;