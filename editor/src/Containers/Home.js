import React from 'react';
import { useHistory } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Modal, Input, notification } from 'antd';
import HomeComponent from '../Components/Home/HomeComponent'; // Assuming your styled component is here
import './Home.module.css'; // Import your main CSS file
const Home = () => {
    const history = useHistory();
    const [isJoinModalVisible, setIsJoinModalVisible] = React.useState(false);
    const [joinRoomId, setJoinRoomId] = React.useState('');

    // This function generates a new ID for a new session
    const createId = () => uuidv4();

    // These functions control the "Join a session" modal
    const showJoinModal = () => {
        setIsJoinModalVisible(true);
    };

    const handleJoin = () => {
        if (joinRoomId.trim()) {
            history.push(`/lobby/${joinRoomId.trim()}`);
        } else {
            notification.warning({ message: 'Please enter a Session ID.' });
        }
    };

    const handleCancel = () => {
        setIsJoinModalVisible(false);
        setJoinRoomId('');
    };

    return (
        <>
            <HomeComponent 
                createId={createId} 
                showJoinModal={showJoinModal} 
            />
            <Modal
                title="Join an Existing Session"
                visible={isJoinModalVisible}
                onOk={handleJoin}
                onCancel={handleCancel}
                okText="Join"
                cancelText="Cancel"
            >
                <p>Please paste the session ID you want to join.</p>
                <Input
                    placeholder="Enter Session ID..."
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value)}
                    onPressEnter={handleJoin}
                />
            </Modal>
        </>
    );
};

export default Home;