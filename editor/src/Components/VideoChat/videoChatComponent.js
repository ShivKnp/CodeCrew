import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Resizable } from 're-resizable';
import Draggable from 'react-draggable';
import styles from './main.module.css';
import {
    FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaPhone,
    FaExpand, FaCompress, FaRegWindowRestore, FaDesktop, FaEye, FaEyeSlash
} from 'react-icons/fa';

const VideoChatComponent = ({ localStream, pinnedStream, pinnedPeer, handleVideoChat, theme, pinnedStreamType }) => {
    const localVideoRef = useRef();
    const pinnedVideoRef = useRef();
    const [isMaximized, setIsMaximized] = useState(false);
    const nodeRef = useRef(null);

    const [isMicOn, setIsMicOn] = useState(() => sessionStorage.getItem('codecrew-mic-on') === 'true');
    const [isCameraOn, setIsCameraOn] = useState(() => sessionStorage.getItem('codecrew-camera-on') === 'true');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [showLocalPreview, setShowLocalPreview] = useState(true);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const lightThemes = ['vs', 'light', 'github', 'solarized-light'];
    const isLight = lightThemes.includes(theme);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, isMaximized]);

    // FIX IS HERE: Added isMaximized to the dependency array
    useEffect(() => {
        if (pinnedVideoRef.current) {
            pinnedVideoRef.current.srcObject = pinnedStream || null;
        }
    }, [pinnedStream, isMaximized]);

    // When our localStream becomes available, inform other clients of the initial mic/camera state
    useEffect(() => {
        if (localStream) {
            const mic = localStream.getAudioTracks().some(t => t.enabled);
            const camera = localStream.getVideoTracks().some(t => t.enabled);
            window.dispatchEvent(new CustomEvent('local-media-update', { detail: { mic, camera } }));
        }
    }, [localStream]);

    const toggleMic = () => {
        if (localStream) {
            const next = !isMicOn;
            localStream.getAudioTracks().forEach(track => track.enabled = next);
            setIsMicOn(next);
            sessionStorage.setItem('codecrew-mic-on', String(next));

            // Notify VideoChat (or any listener) so it can relay this state to peers
            try {
                window.dispatchEvent(new CustomEvent('local-media-update', { detail: { mic: next, camera: isCameraOn } }));
            } catch (err) {
                // gracefully ignore in non-browser envs
            }
        }
    };

    const toggleCamera = () => {
        if (localStream) {
            const next = !isCameraOn;
            localStream.getVideoTracks().forEach(track => track.enabled = next);
            setIsCameraOn(next);
            sessionStorage.setItem('codecrew-camera-on', String(next));

            // Notify VideoChat (or any listener) so it can relay this state to peers
            try {
                window.dispatchEvent(new CustomEvent('local-media-update', { detail: { mic: isMicOn, camera: next } }));
            } catch (err) {
                // ignore in non-browser envs
            }
        }
    };

    const handleToggleScreenShare = () => {
        window.dispatchEvent(new CustomEvent('toggleScreenShare'));
        setIsScreenSharing(prev => !prev);
    };

    const handlePictureInPicture = () => {
        if (document.pictureInPictureEnabled && pinnedVideoRef.current) {
            if (document.pictureInPictureElement) {
                document.exitPictureInPicture();
            } else {
                pinnedVideoRef.current.requestPictureInPicture();
            }
        } else {
            alert('Your browser does not support Picture-in-Picture mode.');
        }
    };

    const containerClasses = [
        styles.container,
        isLight ? styles.lightTheme : styles.darkTheme,
        isMobile ? styles.mobile : '',
        isMaximized ? styles.maximized : styles.docked,
    ].join(' ');

    const initialSize = isMobile ? { width: 140, height: 180 } : { width: 340, height: 255 };

    const VideoWindow = (
        <Draggable nodeRef={nodeRef} handle={`.${styles.dragHandle}`} cancel=".no-drag" disabled={isMaximized}>
            <div ref={nodeRef} className={containerClasses}>
                <Resizable
                    className={styles.resizableContainer}
                    defaultSize={isMaximized ? { width: '100%', height: '100%' } : initialSize}
                    minWidth={120}
                    minHeight={160}
                    enable={{ bottomRight: !isMaximized }}
                    handleClasses={isMaximized ? {} : { bottomRight: styles.resizeHandle }}
                >
                    <div className={styles.videoContent}>
                        <div className={styles.dragHandle}>
                            <span className={styles.pinnedName}>{pinnedPeer ? pinnedPeer.userName : 'Pinned'}</span>
                            <div className={styles.windowActions}>
                                <button className={`${styles.controlButton} ${styles.pipButton} no-drag`} onClick={handlePictureInPicture} title="Picture-in-Picture">
                                    <FaRegWindowRestore size={12} />
                                </button>
                                {isMaximized && (
                                    <button
                                        className={`${styles.controlButton} ${styles.pipButton} no-drag`}
                                        onClick={() => setShowLocalPreview(prev => !prev)}
                                        title={showLocalPreview ? "Hide preview" : "Show preview"}
                                    >
                                        {showLocalPreview ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                                    </button>
                                )}
                                {!isMobile && (
                                    <button className={`${styles.controlButton} ${styles.pipButton} no-drag`} onClick={() => setIsMaximized(!isMaximized)} title={isMaximized ? "Restore" : "Maximize"}>
                                        {isMaximized ? <FaCompress size={12} /> : <FaExpand size={12} />}
                                    </button>
                                )}
                            </div>
                        </div>

                        <video
                            ref={pinnedVideoRef}
                            className={`${styles.mainVideo} ${isMaximized ? styles.mainVideoContain : ''}`}
                            autoPlay
                            playsInline
                        />

                        {pinnedStreamType !== 'screen' && showLocalPreview && (
                            <video ref={localVideoRef} className={styles.localVideoPreview} autoPlay playsInline muted />
                        )}
                        
                        <div className={`${styles.controls} ${isMobile ? styles.mobileControls : ''} no-drag`}>
                            <button className={styles.controlButton} onClick={toggleCamera} aria-label="Toggle camera">
                                {isCameraOn ? <FaVideo size={16} /> : <FaVideoSlash size={16} />}
                            </button>
                            <button className={styles.controlButton} onClick={toggleMic} aria-label="Toggle mic">
                                {isMicOn ? <FaMicrophone size={16} /> : <FaMicrophoneSlash size={16} />}
                            </button>

                            {/* HIDE SCREEN SHARE BUTTON ON MOBILE */}
                            {!isMobile && (
                                <button
                                    className={`${styles.controlButton} ${isScreenSharing ? styles.active : ''}`}
                                    onClick={handleToggleScreenShare}
                                    title="Share Screen"
                                >
                                    <FaDesktop size={16} />
                                </button>
                            )}

                            <button className={`${styles.controlButton} ${styles.danger}`} onClick={handleVideoChat}><FaPhone size={16} /></button>
                        </div>
                    </div>
                </Resizable>
            </div>
        </Draggable>
    );

    if (isMaximized || isMobile) {
        return createPortal(VideoWindow, document.body);
    }

    return VideoWindow;
};

export default VideoChatComponent;
