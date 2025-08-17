import React from 'react';
import Draggable from 'react-draggable';
import styles from './main.module.css';
import { 
  FaVideo, 
  FaVideoSlash, 
  FaMicrophone, 
  FaMicrophoneSlash,
  FaPhone,
  FaExpand,
  FaCompress
} from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

const VideoChatComponent = props => {
    const { 
        draggableRef,
        remoteRef,
        localRef,
        peerConnected,
        controls,
        gotMediaDevice,
        toggleVideo,
        toggleAudio,
        createOffer,
        connecting,
        handleVideoChat
    } = props;

    const [maximized, setMaximized] = React.useState(false);

    // ensure draggableRef exists and points at the DOM node
    // when maximizing, size/position the container to match the editor area
    React.useEffect(() => {
      const node = draggableRef && draggableRef.current ? draggableRef.current : null;
      if (!node) return;

      if (maximized) {
        const editorEl = document.querySelector('.editorContainer') || document.querySelector('.resizableEditor') || document.documentElement;
        const rect = editorEl.getBoundingClientRect();

        // apply inline styles so it matches the editor area exactly
        node.style.position = 'fixed';
        node.style.left = `${Math.round(rect.left)}px`;
        node.style.top = `${Math.round(rect.top)}px`;
        node.style.width = `${Math.round(rect.width)}px`;
        node.style.height = `${Math.round(rect.height)}px`;
        node.style.right = 'auto';
        node.style.bottom = 'auto';
        // ensure we don't carry any dragging transform through
        node.style.transform = 'none';
      } else {
        // restore to bottom-right default (allow CSS to handle other properties)
        node.style.left = '';
        node.style.top = '';
        node.style.width = '';
        node.style.height = '';
        node.style.right = '20px';
        node.style.bottom = '22px';
        node.style.transform = '';
        // keep position fixed so CSS still applies fixed placement
        node.style.position = 'fixed';
      }
    }, [maximized, draggableRef]);

    return (
        <Draggable 
            nodeRef={draggableRef} 
            handle=".drag-handle"
            bounds="parent"
            cancel=".no-drag"
            disabled={maximized}              /* disable drag while maximized */
        >
            <div 
                ref={draggableRef} 
                className={`${styles.videoContainer} ${maximized ? styles.maximized : ''}`}
            >
                <div className="drag-handle" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '30px',
                    cursor: 'move',
                    zIndex: 5
                }} />
                
                <button 
                    className={`${styles.toggleButton} no-drag`}
                    onClick={() => setMaximized(!maximized)}
                >
                    {maximized ? <FaCompress size={14} /> : <FaExpand size={14} />}
                </button>
                
                {connecting && (
                    <div className={styles.connectionStatus}>
                        <div className={`${styles.statusIndicator} ${styles.connecting}`} />
                        <span>Connecting...</span>
                    </div>
                )}
                
                {peerConnected && (
                    <div className={styles.connectionStatus}>
                        <div className={`${styles.statusIndicator} ${styles.connected}`} />
                        <span>Connected</span>
                    </div>
                )}
                
                <video
                    className={styles.remoteVideo}
                    ref={remoteRef}
                    autoPlay={true}
                    muted={!peerConnected}
                />
                
                <video
                    className={styles.localVideo}
                    ref={localRef}
                    autoPlay={true}
                    muted={true}
                />
                
                {peerConnected && (
                    <div className={`${styles.controls} no-drag`}>
                        <button 
                            className={styles.controlButton}
                            onClick={toggleVideo}
                            title={controls.video ? "Turn off video" : "Turn on video"}
                        >
                            {controls.video ? <FaVideo size={16} /> : <FaVideoSlash size={16} />}
                        </button>
                        <button 
                            className={styles.controlButton}
                            onClick={toggleAudio}
                            title={controls.audio ? "Mute microphone" : "Unmute microphone"}
                        >
                            {controls.audio ? <FaMicrophone size={16} /> : <FaMicrophoneSlash size={16} />}
                        </button>
                        <button 
                            className={`${styles.controlButton} ${styles.danger}`}
                            onClick={handleVideoChat}
                            title="End call"
                        >
                            <FaPhone size={16} />
                        </button>
                    </div>
                )}
                
                {gotMediaDevice && !peerConnected && (
                    <button 
                        className={styles.startButton}
                        onClick={createOffer}
                    >
                        Start Call
                    </button>
                )}
            </div>
        </Draggable>
    );
};

export default VideoChatComponent;
