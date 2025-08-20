import React, { useState, useEffect } from 'react';
import { Input, Button, Select, Divider, Popover } from 'antd';
import {
    PlayCircleOutlined,
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
        lang,
        handleLang,
        handleRun,
        handleInput,
        runCodeDisabled,
        theme,
        participantsDrawerVisible
    } = props;

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= 900);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const lightThemes = ['vs', 'light', 'github', 'solarized-light'];
    const isLight = lightThemes.includes(theme);

    const drawerClasses = [
        styles.sideDrawer,
        isLight ? styles.lightTheme : '',
        isMobile ? styles.mobileSheet : '',
        (isMobile && participantsDrawerVisible) ? styles.hidden : ''
    ].join(' ');

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
        <div className={drawerClasses}>
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
                        getPopupContainer={(triggerNode) => {
                            try {
                                return triggerNode?.closest(`.${styles.mobileContent}`) || document.body;
                            } catch (e) {
                                return document.body;
                            }
                        }}
                        overlayStyle={{ zIndex: 1900 }}
                        overlayClassName={styles.inviteOverlay}
                    >
                        <Button type="text" icon={<ShareAltOutlined />} className={styles.actionButton} />
                    </Popover>
                </div>
            </div>

            <div className={styles.mobileContent}>
                <div className={styles.controlSection}>
                    <label className={styles.controlLabel}>Language</label>
                    <Select
                        value={lang}
                        onChange={handleLang}
                        className={styles.languageSelect}
                        suffixIcon={<CodeOutlined />}
                        dropdownClassName={`codecrew-lang-dropdown ${isLight ? 'light' : 'dark'}`}
                        getPopupContainer={(triggerNode) => {
                            if (!triggerNode) return document.body;
                            try {
                                if (isMobile) {
                                    return triggerNode.closest(`.${styles.mobileContent}`) || triggerNode.parentElement || document.body;
                                }
                            } catch (e) {
                                return document.body;
                            }
                            return document.body;
                        }}
                    >
                        {languageOptions.map(option => (
                            <Option key={option.value} value={option.value} className={styles.optionItem}>
                                <span className={styles.optionContent}>
                                    {option.icon}
                                    {option.label}
                                </span>
                            </Option>
                        ))}
                    </Select>
                </div>

                <Divider className={styles.divider} />

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
                        autoSize={{ minRows: 4, maxRows: 8 }}
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
                        autoSize={{ minRows: 4, maxRows: 8 }}
                    />
                </div>
            </div>

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