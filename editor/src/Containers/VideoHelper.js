import { notification } from 'antd'

const helper = {
    peerConnectionInit: (videoSocket, userId, onTrack, context) => {
        let pc = new window.RTCPeerConnection({
            iceServers: [
                {
                    urls: 'stun:stun.l.google.com:19302'
                },
                {
                    urls: 'turn:numb.viagenie.ca',
                    username: 'webrtc@live.com',
                    credential: 'muazkh'
                },
            ]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                videoSocket.send(JSON.stringify({ to: userId, type: 'candidate', data: event.candidate, context }));
            }
        };

        pc.ontrack = (event) => {
            onTrack(userId, event.streams[0], context);
        };

        return pc;
    },
    error: (err) => {
        console.error('WebRTC Error', err);
    },
    handleLocalMediaStreamError: (error) => {
        console.log('navigator.getUserMedia error: ', error);
        notification.error({
            message: error.toString(),
            description: 'Please allow access to camera and microphone',
        })
    }
}

export default helper;