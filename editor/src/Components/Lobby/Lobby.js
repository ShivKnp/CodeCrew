import React, { useState, useEffect, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Input, Button, notification } from 'antd';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import styles from './lobby.module.css';

const Lobby = () => {
    const [userName, setUserName] = useState('');
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [localStream, setLocalStream] = useState(null);
    const videoRef = useRef(null);
    const history = useHistory();
    const { id } = useParams();

    useEffect(() => {
        const getMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing media devices.", err);
                notification.error({
                    message: 'Media Access Denied',
                    description: 'Please allow access to your camera and microphone to continue.',
                    placement: 'topRight',
                });
            }
        };
        getMedia();

        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const toggleMic = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
            setIsMicOn(prev => !prev);
        }
    };

    const toggleCamera = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
                if (!track.enabled) {
                    // Stop the track to turn off the camera light
                    track.stop();
                }
            });
            // If turning camera back on, we need to get a new stream
            if (!isCameraOn) {
                 navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
                    setLocalStream(stream);
                    if (videoRef.current) videoRef.current.srcObject = stream;
                 });
            }
            setIsCameraOn(prev => !prev);
        }
    };

    const handleJoin = () => {
        if (!userName.trim()) {
            notification.warning({
                message: 'Name Required',
                description: 'Please enter your name to join the session.',
                placement: 'topRight',
            });
            return;
        }
        // Store settings in sessionStorage to pass to the editor
        sessionStorage.setItem('codecrew-username', userName);
        sessionStorage.setItem('codecrew-mic-on', isMicOn);
        sessionStorage.setItem('codecrew-camera-on', isCameraOn);

        // Stop the tracks before navigating
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }

        history.push(`/${id}`);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href.replace('/lobby', ''));
        notification.success({
            message: 'Link Copied!',
            description: 'The session link has been copied to your clipboard.',
            placement: 'topRight',
        });
    };

    return (
        <div className={styles.lobbyContainer}>
            <div className={styles.mainContent}>
                <div className={styles.videoPreview}>
                    <video ref={videoRef} autoPlay playsInline muted className={styles.videoElement} />
                    <div className={styles.mediaControls}>
                        <Button
                            shape="circle"
                            icon={isMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                            onClick={toggleMic}
                            className={!isMicOn ? styles.off : ''}
                        />
                        <Button
                            shape="circle"
                            icon={isCameraOn ? <FaVideo /> : <FaVideoSlash />}
                            onClick={toggleCamera}
                            className={!isCameraOn ? styles.off : ''}
                        />
                    </div>
                </div>
                <div className={styles.joinControls}>
                    <h2 className={styles.title}>Ready to join?</h2>
                    <Input
                        placeholder="Your name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className={styles.nameInput}
                        onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                    />
                    <Button type="primary" onClick={handleJoin} className={styles.joinButton}>
                        Join Session
                    </Button>
                    <Button onClick={handleCopyLink} className={styles.copyButton}>
                        Copy Session Link
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Lobby;