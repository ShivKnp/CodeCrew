import { Component } from 'react';

class SessionPresence extends Component {
    constructor(props) {
        super(props);
        this.state = {
            participants: new Map(),
            myId: null,
        };
        // **FIX:** Bind the message handler once
        this.handleMessage = this.handleMessage.bind(this);
    }

    componentDidMount() {
        const { socket } = this.props;
        if (socket) {
            socket.addEventListener('message', this.handleMessage);
            // If the socket is already open, we might need to send join immediately
            if (socket.readyState === 1) { // 1 === OPEN
                 this.setState({ myId: 'pending' }); // Temporarily set to avoid race conditions
                 socket.send(JSON.stringify({ type: 'join', name: this.props.userName }));
            }
        }
    }

    componentWillUnmount() {
        // **FIX:** Clean up listener when component unmounts
        const { socket } = this.props;
        if (socket) {
            socket.removeEventListener('message', this.handleMessage);
        }
    }

    handleMessage(event) {
        const message = JSON.parse(event.data);
        const { from, type, name, id } = message;

        if (this.state.myId && from === this.state.myId) {
            return;
        }

        switch (type) {
            case 'connection-success':
                this.setState({ myId: id });
                // The join message might already be sent, but resending is safe
                this.props.socket.send(JSON.stringify({ type: 'join', name: this.props.userName }));
                this.updateParticipant('local', { name: this.props.userName, hasVideo: this.props.videoStatus === 'on' });
                break;
            case 'join':
                this.updateParticipant(from, { name, hasVideo: false });
                if (this.props.socket && this.props.videoStatus === 'on') {
                   this.props.socket.send(JSON.stringify({ type: 'video-status', status: 'on' }));
                }
                break;
            case 'leave':
                this.removeParticipant(from);
                break;
            case 'video-status':
                this.updateParticipant(from, { hasVideo: message.status === 'on' });
                break;
            default:
                break;
        }
    }
    
    componentDidUpdate(prevProps) {
        if (this.props.videoStatus !== prevProps.videoStatus && this.props.socket) {
            this.props.socket.send(JSON.stringify({ type: 'video-status', status: this.props.videoStatus }));
            this.updateParticipant('local', { hasVideo: this.props.videoStatus === 'on' });
        }
    }

    updateParticipant = (id, data) => {
        this.setState(prevState => {
            const newParticipants = new Map(prevState.participants);
            const existing = newParticipants.get(id) || {};
            newParticipants.set(id, { ...existing, ...data });
            this.props.onParticipantsUpdate(newParticipants);
            return { participants: newParticipants };
        });
    };
    
    removeParticipant = (id) => {
        this.setState(prevState => {
            const newParticipants = new Map(prevState.participants);
            newParticipants.delete(id);
            this.props.onParticipantsUpdate(newParticipants);
            return { participants: newParticipants };
        });
    };

    render() {
        return null;
    }
}

export default SessionPresence;