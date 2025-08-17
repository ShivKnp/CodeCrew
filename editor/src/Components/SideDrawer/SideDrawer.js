import React from 'react';
import { Input, Button, Select, Divider, Popover } from 'antd';
import { 
  PlayCircleOutlined,
  VideoCameraOutlined,
  ShareAltOutlined,
  ConsoleSqlOutlined,
  FileTextOutlined,
  CodeOutlined
} from '@ant-design/icons';
import styles from './main.module.css';

const { TextArea } = Input;
const { Option } = Select;

const SideDrawer = (props) => {
    const {
        input,
        output,
        videoChat,
        lang,
        handleLang,
        handleRun,
        handleInput,
        handleVideoChat,
        runCodeDisabled,
        theme
    } = props;

    // <-- Important: only treat these as 'light' themes for the drawer.
    // Default for everything else will be dark.
    const lightThemes = ['vs', 'light', 'github', 'solarized-light'];
    const isLight = lightThemes.includes(theme);

    const inviteContent = (
        <div className={styles.invitePopoverContent}>
            <h4>Invite Collaborator</h4>
            <p className={styles.inviteHint}>Share this link to start pair programming</p>
            <div className={styles.inviteInputGroup}>
                <Input 
                    value={window.location.href} 
                    readOnly 
                    className={styles.inviteInput}
                />
                <Button 
                    type="primary" 
                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                    className={styles.copyButton}
                >
                    Copy
                </Button>
            </div>
        </div>
    );

    const languageOptions = [
        { value: 'cpp', icon: <CodeOutlined />, label: 'C++' },
        { value: 'java', icon: <CodeOutlined />, label: 'Java' },
        { value: 'python', icon: <CodeOutlined />, label: 'Python 3' }
    ];

    return (
        <div className={`${styles.sideDrawer} ${isLight ? styles.lightTheme : styles.darkTheme}`}>
            {/* Header Section */}
            <div className={styles.header}>
                <h3 className={styles.title}>
                    <ConsoleSqlOutlined className={styles.titleIcon} />
                    Code Companion
                </h3>
                <div className={styles.actions}>
                    <Popover 
                        content={inviteContent} 
                        trigger="click" 
                        placement="bottomRight"
                    >
                        <Button 
                            type="text" 
                            icon={<ShareAltOutlined />} 
                            className={styles.actionButton}
                        />
                    </Popover>
                    <Button 
                        type={videoChat ? "default" : "text"} 
                        icon={<VideoCameraOutlined />} 
                        onClick={handleVideoChat}
                        className={`${styles.actionButton} ${videoChat ? styles.videoActive : ''}`}
                    />
                </div>
            </div>

            {/* Language Selector */}
            <div className={styles.controlSection}>
                <label className={styles.controlLabel}>Language</label>
                <Select
                    value={lang}
                    onChange={handleLang}
                    className={styles.languageSelect}
                    suffixIcon={<CodeOutlined />}
                    dropdownClassName={`${styles.dropdownMenu} ${isLight ? '' : styles.darkDropdown}`}
                    popupMatchSelectWidth={false}
                >
                    {languageOptions.map(option => (
                        <Option 
                            key={option.value} 
                            value={option.value}
                            className={styles.optionItem}
                        >
                            <span className={styles.optionContent}>
                                {option.icon}
                                {option.label}
                            </span>
                        </Option>
                    ))}
                </Select>
            </div>

            <Divider className={styles.divider} />

            {/* Input/Output Sections */}
            <div className={styles.ioSection}>
                <div className={styles.ioHeader}>
                    <FileTextOutlined className={styles.ioIcon} />
                    <span className={styles.ioTitle}>Custom Input</span>
                </div>
                <TextArea 
                    value={input} 
                    onChange={handleInput} 
                    className={`${styles.ioArea} ${styles.inputArea}`}
                    placeholder="Enter test cases here..."
                    autoSize={{ minRows: 4, maxRows: 6 }}
                />
            </div>

            <div className={styles.ioSection}>
                <div className={styles.ioHeader}>
                    <PlayCircleOutlined className={styles.ioIcon} />
                    <span className={styles.ioTitle}>Output</span>
                </div>
                <TextArea 
                    value={output} 
                    readOnly 
                    className={`${styles.ioArea} ${styles.outputArea}`}
                    autoSize={{ minRows: 4, maxRows: 6 }}
                />
            </div>

            {/* Run Button */}
            <div className={styles.runSection}>
                <Button 
                    type="primary" 
                    icon={<PlayCircleOutlined />} 
                    onClick={handleRun} 
                    loading={runCodeDisabled}
                    disabled={runCodeDisabled}
                    block
                    size="large"
                    className={styles.runButton}
                >
                    {runCodeDisabled ? "Executing..." : "Run Code"}
                </Button>
            </div>
        </div>
    );
};

export default SideDrawer;
