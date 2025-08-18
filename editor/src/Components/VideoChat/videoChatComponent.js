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
    handleVideoChat,
    isMobile
  } = props;

  const [maximized, setMaximized] = React.useState(false);

  // Responsive sizing logic (keeps small preview on mobile bottom-right)
  React.useEffect(() => {
    const node = draggableRef && draggableRef.current ? draggableRef.current : null;
    if (!node) return;

    if (maximized) {
      node.style.position = 'fixed';
      node.style.left = '50%';
      node.style.top = isMobile ? '6vh' : '50%';
      node.style.transform = isMobile ? 'translateX(-50%)' : 'translate(-50%, -50%)';
      node.style.width = isMobile ? 'calc(100% - 20px)' : '86vw';
      node.style.height = isMobile ? '60vh' : '78vh';
      node.style.right = 'auto';
      node.style.bottom = 'auto';
      node.classList.add(styles.maximized);
    } else {
      node.style.position = 'fixed';
      node.style.transform = '';
      if (isMobile) {
        node.style.width = '160px';
        node.style.height = '120px';
        node.style.right = '12px';
        node.style.bottom = `calc(var(--mobile-sheet-height, 0px) + 12px)`;
        node.style.left = 'auto';
        node.style.top = 'auto';
      } else {
        node.style.left = '';
        node.style.top = '';
        node.style.width = '';
        node.style.height = '';
        node.style.right = '20px';
        node.style.bottom = '22px';
      }
      node.classList.remove(styles.maximized);
    }
  }, [maximized, isMobile, draggableRef]);

  /* ===== Add one safe non-passive touchstart listener =====
     Purpose:
     - We attach a native listener with { passive: false } so preventDefault() will actually be effective
       where needed (on touches that start on non-interactive areas).
     - If the touch started on an interactive element (button/a/input/textarea/select or element with .no-drag),
       we DO NOT call preventDefault(), so the element still receives normal tap/click behavior.
  */
  React.useEffect(() => {
    const node = draggableRef && draggableRef.current ? draggableRef.current : null;
    if (!node) return;

    const onTouchStart = (e) => {
      // Only apply for mobile and when not maximized (we want dragging on small preview)
      if (!isMobile || maximized) return;

      // If the touch target is inside an interactive control, do not preventDefault
      // This keeps buttons/toggles clickable.
      const interactiveSelector = 'button, a, input, textarea, select, [role="button"], .no-drag, .controlButton, .toggleButton, .startButton';
      const targetIsInteractive = e.target && e.target.closest && e.target.closest(interactiveSelector);

      if (!targetIsInteractive) {
        // preventDefault so the browser doesn't treat this as a scroll/gesture.
        if (e.cancelable) e.preventDefault();
      }
      // else: allow default so taps on controls generate click events
    };

    node.addEventListener('touchstart', onTouchStart, { passive: false });

    return () => {
      node.removeEventListener('touchstart', onTouchStart, { passive: false });
    };
  }, [draggableRef, isMobile, maximized]);

  // Only disable dragging when maximized; allow dragging on mobile small preview
  const draggableDisabled = maximized;

  return (
    <Draggable
      nodeRef={draggableRef}
      // On mobile allow dragging from entire container so user can touch anywhere on preview.
      // On desktop keep the drag handle experience (less accidental drags).
      handle={isMobile ? undefined : '.drag-handle'}
      cancel=".no-drag, button, .controlButton, .startButton, .toggleButton"
      disabled={draggableDisabled}
      enableUserSelectHack={true}
      axis="both"
      allowAnyClick={true}
    >
      <div 
        ref={draggableRef} 
        className={`${styles.videoContainer} ${maximized ? styles.maximized : ''}`}
        style={{ touchAction: 'none', WebkitUserSelect: 'none' }} // helpful fallback
      >
        <div 
          className="drag-handle" 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '30px',
            cursor: 'move',
            zIndex: 50,
            touchAction: 'none'
          }}
        />

        <button 
          className={`${styles.toggleButton} no-drag`}
          onClick={() => setMaximized(!maximized)}
          aria-label={maximized ? "Restore video" : "Maximize video"}
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
