import React, { Component } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import VideoHelper from './VideoHelper';

const websocketURL = process.env.REACT_APP_WEB_SOCKET_URL || 'ws://localhost:8080';

class VideoChat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            videoSocket: null,
            localStream: null,
            peers: new Map(),
            isScreenSharing: false,
            localPeerId: null,
        };
        this.screenStream = null;
        this.screenPcMap = new Map();

        this.handleNewUser = this.handleNewUser.bind(this);
        this.handleOffer = this.handleOffer.bind(this);
        this.handleAnswer = this.handleAnswer.bind(this);
        this.handleCandidate = this.handleCandidate.bind(this);
        this.handleLeave = this.handleLeave.bind(this);
        this.addTrack = this.addTrack.bind(this);
    }

    componentDidMount() {
        const isMicInitiallyOn = sessionStorage.getItem('codecrew-mic-on') === 'true';
        const isCameraInitiallyOn = sessionStorage.getItem('codecrew-camera-on') === 'true';

        const { roomId } = this.props;

    // ✅ Use the roomId in the WebSocket URL
    const videoSocket = new ReconnectingWebSocket(`${websocketURL}/foo/${roomId}`);
    this.setState({ videoSocket });

        videoSocket.addEventListener('open', () => {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(stream => {
                    stream.getAudioTracks().forEach(track => track.enabled = isMicInitiallyOn);
                    stream.getVideoTracks().forEach(track => track.enabled = isCameraInitiallyOn);
                    this.setState({ localStream: stream });
                    if (this.props.onLocalStream) {
                        this.props.onLocalStream(stream);
                    }
                    // The server will assign an ID, so we send the join message here
                    videoSocket.send(JSON.stringify({ type: 'join', name: this.props.userName }));
                })
                .catch(VideoHelper.handleLocalMediaStreamError);
        });

        videoSocket.addEventListener('message', event => {
            const message = JSON.parse(event.data);
            const { from, type, data, name, context, id } = message;

            if (type === 'assign-id') {
                this.setState({ localPeerId: id });
                if (this.props.onLocalPeerId) {
                    this.props.onLocalPeerId(id);
                }
                return;
            }

            switch (type) {
                case 'join':
                    this.handleNewUser(from, name, videoSocket);
                    if (this.state.isScreenSharing && this.screenStream) {
                        this.initiateScreenShareToPeer(from, videoSocket);
                    }
                    break;
                case 'offer':
                    this.handleOffer(from, name, data, videoSocket, context);
                    break;
                case 'answer':
                    this.handleAnswer(from, data, context);
                    break;
                case 'candidate':
                    this.handleCandidate(from, data, context);
                    break;
                case 'leave':
                    this.handleLeave(from, context);
                    break;
            }
        });

        window.addEventListener('toggleScreenShare', this.handleToggleScreenShare);
    }

    componentWillUnmount() {
        if (this.state.videoSocket) this.state.videoSocket.close();
        if (this.state.localStream) {
            this.state.localStream.getTracks().forEach(track => track.stop());
        }
        this.stopScreenShare(false);
        this.state.peers.forEach(peer => peer.pc.close());
        window.removeEventListener('toggleScreenShare', this.handleToggleScreenShare);
    }

    handleToggleScreenShare = () => {
        if (this.state.isScreenSharing) {
            this.stopScreenShare();
        } else {
            this.startScreenShare();
        }
    };

    initiateScreenShareToPeer = (userId, videoSocket) => {
        const screenPc = VideoHelper.peerConnectionInit(videoSocket, userId, this.addTrack, 'screen');
        this.screenStream.getTracks().forEach(track => screenPc.addTrack(track, this.screenStream));
        this.screenPcMap.set(userId, screenPc);

        screenPc.createOffer()
            .then(offer => screenPc.setLocalDescription(offer))
            .then(() => {
                videoSocket.send(JSON.stringify({ to: userId, type: 'offer', data: screenPc.localDescription, context: 'screen' }));
            });
    }

    startScreenShare = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: false });
    this.screenStream = stream;

    // avoid feedback loop on the sharing machine
    document.body.classList.add('screen-sharing');

    this.state.peers.forEach((peer, userId) => {
      this.initiateScreenShareToPeer(userId, this.state.videoSocket);
    });

    stream.getVideoTracks()[0].onended = () => {
      this.stopScreenShare();
    };
    this.setState({ isScreenSharing: true });
  } catch (err) {
    console.error("Error starting screen share:", err);
    this.setState({ isScreenSharing: false });
  }
};


stopScreenShare = (notify = true) => {
  if (this.screenStream) {
    this.screenStream.getTracks().forEach(track => track.stop());
    this.screenStream = null;
  }
  this.screenPcMap.forEach(pc => pc.close());
  this.screenPcMap.clear();

  if (notify && this.state.videoSocket) {
    this.state.videoSocket.send(JSON.stringify({ type: 'leave', context: 'screen' }));
  }

  this.setState({ isScreenSharing: false });
  document.body.classList.remove('screen-sharing');
};


    updatePeers = (newPeers) => {
        this.setState({ peers: newPeers }, () => {
            if (this.props.onPeersUpdate) {
                this.props.onPeersUpdate(this.state.peers);
            }
        });
    }

    addTrack(userId, stream, context) {
        const newPeers = new Map(this.state.peers);
        const peer = newPeers.get(userId) || { id: userId, userName: 'Anonymous' };

        if (context === 'screen') {
            newPeers.set(userId, { ...peer, screenStream: stream });
        } else {
            newPeers.set(userId, { ...peer, stream: stream });
        }
        this.updatePeers(newPeers);
    }

    handleNewUser(userId, userName, videoSocket) {
        if (!this.state.localStream) return;
        const pc = VideoHelper.peerConnectionInit(videoSocket, userId, this.addTrack, 'webcam');
        this.state.localStream.getTracks().forEach(track => pc.addTrack(track, this.state.localStream));
        const newPeers = new Map(this.state.peers).set(userId, { pc, userName, id: userId });
        this.updatePeers(newPeers);

        pc.createOffer()
            .then(offer => pc.setLocalDescription(offer))
            .then(() => {
                videoSocket.send(JSON.stringify({ to: userId, type: 'offer', data: pc.localDescription, context: 'webcam' }));
            })
            .catch(VideoHelper.error);
    }

    handleOffer(userId, userName, offer, videoSocket, context) {
        const pc = VideoHelper.peerConnectionInit(videoSocket, userId, this.addTrack, context);
        
        if (context === 'screen') {
            this.screenPcMap.set(userId, pc);
        } else {
            if (!this.state.localStream) return;
            this.state.localStream.getTracks().forEach(track => pc.addTrack(track, this.state.localStream));
            const newPeers = new Map(this.state.peers).set(userId, { pc, userName, id: userId });
            this.updatePeers(newPeers);
        }

        pc.setRemoteDescription(new RTCSessionDescription(offer))
            .then(() => pc.createAnswer())
            .then(answer => pc.setLocalDescription(answer))
            .then(() => {
                videoSocket.send(JSON.stringify({ to: userId, type: 'answer', data: pc.localDescription, context }));
            })
            .catch(VideoHelper.error);
    }

    handleAnswer(userId, answer, context) {
        const pc = context === 'screen' ? this.screenPcMap.get(userId) : this.state.peers.get(userId)?.pc;
        if (pc) pc.setRemoteDescription(new RTCSessionDescription(answer)).catch(VideoHelper.error);
    }

    handleCandidate(userId, candidate, context) {
        const pc = context === 'screen' ? this.screenPcMap.get(userId) : this.state.peers.get(userId)?.pc;
        if (pc) pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(VideoHelper.error);
    }

    handleLeave(userId, context) {
        if (context === 'screen') {
            const newPeers = new Map(this.state.peers);
            const peer = newPeers.get(userId);
            if (peer) {
                delete peer.screenStream;
                newPeers.set(userId, peer);
                this.updatePeers(newPeers);
            }
            const screenPc = this.screenPcMap.get(userId);
            if(screenPc) screenPc.close();
            this.screenPcMap.delete(userId);
        } else {
            const peer = this.state.peers.get(userId);
            if (peer && peer.pc) peer.pc.close();
            
            const screenPc = this.screenPcMap.get(userId);
            if (screenPc) screenPc.close();

            const newPeers = new Map(this.state.peers);
            newPeers.delete(userId);
            this.screenPcMap.delete(userId);
            this.updatePeers(newPeers);
        }
    }

    render() { return null; }
}

export default VideoChat;