import React, { useRef, useEffect, useState } from "react";
import MonacoEditor from "react-monaco-editor";
import { Resizable } from "re-resizable";
import { Dropdown, Button, Space, Tooltip, Menu } from 'antd';
import { 
  FontSizeOutlined, 
  FontColorsOutlined, 
  BgColorsOutlined,
  CaretDownOutlined,
  CodeOutlined
} from '@ant-design/icons';
import styles from "./main.module.css";
import SideDrawer from "../SideDrawer/SideDrawer";
import VideoChat from "../../Containers/VideoChat";

const EditorComponent = (props) => {
  const {
    videoChat,
    lang,
    code,
    input,
    output,
    runCodeDisabled,
    videoSocket,
    readOnly,
    handleVideoChat,
    editorDidMount,
    editorOnChange,
    handleLang,
    handleRun,
    handleInput,
    handleVideoSocket,
    theme,
    fontSize,
    toggleTheme,
    increaseFont,
    decreaseFont
  } = props;

  const [fontFamily, setFontFamily] = useState('Consolas');
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  // Light themes list — keep consistent with SideDrawer
  const lightThemes = ['vs', 'light', 'github', 'solarized-light'];
  const isLight = lightThemes.includes(theme);

  // Available themes
  const themes = [
    { name: 'Dracula', value: 'dracula' },
    { name: 'Dark', value: 'vs-dark' },
    { name: 'Light', value: 'vs' },
    { name: 'High Contrast', value: 'hc-black' },
    { name: 'GitHub', value: 'github' },
    { name: 'Solarized Light', value: 'solarized-light' }
  ];

  // Available fonts
  const fonts = [
    'Fira Code',
    'Consolas',
    'Courier New'
  ];

  // Font sizes
  const fontSizes = [10, 12, 14, 16, 18, 20, 22, 24];

  const editorOptions = {
    selectOnLineNumbers: true,
    minimap: { enabled: false },
    readOnly,
    fontSize: fontSize,
    fontFamily: fontFamily,
    theme: theme,
    automaticLayout: true,
    lineHeight: 24,
    wordWrap: 'on',
    scrollBeyondLastLine: false,
    renderWhitespace: 'selection',
    quickSuggestions: false,
    suggestOnTriggerCharacters: false
  };

  // Load additional themes
  useEffect(() => {
    if (window.monaco) {
      // Dracula theme
      window.monaco.editor.defineTheme('dracula', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: '', foreground: 'f8f8f2', background: '282a36' },
          { token: 'keyword', foreground: 'ff79c6' },
          { token: 'number', foreground: 'bd93f9' },
          { token: 'string', foreground: 'f1fa8c' },
          { token: 'comment', foreground: '6272a4' }
        ],
        colors: {
          'editor.background': '#282a36',
          'editor.lineHighlightBackground': '#383a4f',
          'editorCursor.foreground': '#f8f8f0',
          'editor.selectionBackground': '#44475a'
        }
      });

      // GitHub theme
      window.monaco.editor.defineTheme('github', {
        base: 'vs',
        inherit: true,
        rules: [
          { token: 'keyword', foreground: 'cf222e' },
          { token: 'string', foreground: '0a3069' },
          { token: 'number', foreground: '0550ae' },
          { token: 'comment', foreground: '656d76' }
        ],
        colors: {
          'editor.background': '#ffffff',
          'editor.lineHighlightBackground': '#f6f8fa',
          'editorCursor.foreground': '#24292f'
        }
      });

      // Solarized Light
      window.monaco.editor.defineTheme('solarized-light', {
        base: 'vs',
        inherit: true,
        rules: [
          { token: 'keyword', foreground: '268bd2' },
          { token: 'string', foreground: '2aa198' },
          { token: 'number', foreground: 'd33682' },
          { token: 'comment', foreground: '93a1a1' }
        ],
        colors: {
          'editor.background': '#fdf6e3',
          'editor.lineHighlightBackground': '#eee8d5',
          'editorCursor.foreground': '#586e75'
        }
      });
    }
  }, []);

  const handleThemeChange = (newTheme) => {
    toggleTheme(newTheme);
  };

  const handleFontChange = (newFont) => {
    setFontFamily(newFont);
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    if (editorDidMount) {
      editorDidMount(editor, monaco);
    }
  };

  // Create menu items for each dropdown
  const themeMenu = (
    <Menu>
      {themes.map(t => (
        <Menu.Item 
          key={t.value} 
          onClick={() => handleThemeChange(t.value)}
          className={theme === t.value ? 'ant-menu-item-selected' : ''}
        >
          {t.name}
        </Menu.Item>
      ))}
    </Menu>
  );

  const fontMenu = (
    <Menu>
      {fonts.map(f => (
        <Menu.Item 
          key={f} 
          onClick={() => handleFontChange(f)}
          className={fontFamily === f ? 'ant-menu-item-selected' : ''}
        >
          {f}
        </Menu.Item>
      ))}
    </Menu>
  );

  const fontSizeMenu = (
    <Menu>
      {fontSizes.map(s => (
        <Menu.Item 
          key={s} 
          onClick={() => increaseFont(s)}
          className={fontSize === s ? 'ant-menu-item-selected' : ''}
        >
          {s}px
        </Menu.Item>
      ))}
    </Menu>
  );

  const renderControlBar = () => (
    <div className={`${styles.controlBar} ${isLight ? styles.lightControlBar : ''}`}>
      <Space size="middle">
        <CodeOutlined style={{ fontSize: 18 }} />
        
        {/* Theme Selector */}
        <Dropdown overlay={themeMenu} trigger={['click']}>
          <Button type="text" className={styles.controlButton}>
            <Space>
              <BgColorsOutlined />
              {themes.find(t => t.value === theme)?.name || 'Theme'}
              <CaretDownOutlined />
            </Space>
          </Button>
        </Dropdown>

        {/* Font Selector */}
        <Dropdown overlay={fontMenu} trigger={['click']}>
          <Button type="text" className={styles.controlButton}>
            <Space>
              <FontColorsOutlined />
              {fontFamily}
              <CaretDownOutlined />
            </Space>
          </Button>
        </Dropdown>

        {/* Font Size */}
        <Dropdown overlay={fontSizeMenu} trigger={['click']}>
          <Button type="text" className={styles.controlButton}>
            <Space>
              <FontSizeOutlined />
              {fontSize}px
              <CaretDownOutlined />
            </Space>
          </Button>
        </Dropdown>

        {/* Quick Adjust */}
        <Tooltip title="Decrease font size">
          <Button 
            type="text"
            icon={<span style={{ fontWeight: 'bold' }}>A-</span>} 
            onClick={() => decreaseFont()} 
            className={styles.controlButton}
          />
        </Tooltip>
        <Tooltip title="Increase font size">
          <Button 
            type="text"
            icon={<span style={{ fontWeight: 'bold' }}>A+</span>} 
            onClick={() => increaseFont()} 
            className={styles.controlButton}
          />
        </Tooltip>
      </Space>
    </div>
  );

  return (
    <div className={`${styles.container} ${isLight ? styles.lightTheme : styles.dark}`}>
      {videoChat && (
        <VideoChat
          videoChat={videoChat}
          videoSocket={videoSocket}
          handleVideoChat={handleVideoChat}
          handleVideoSocket={handleVideoSocket}
        />
      )}
      
      <div className={styles.mainContent}>
        <Resizable
          defaultSize={{ width: '70%', height: '100%' }}
          minWidth="50%"
          maxWidth="85%"
          enable={{ right: true }}
          className={`${styles.resizableEditor} ${isLight ? styles.lightResizable : ''}`}
          onResize={() => {
            if (editorRef.current) {
              editorRef.current.layout();
            }
          }}
        >
          <div className={styles.editorWrapper}>
            {renderControlBar()}
            <div className={styles.editorContainer} ref={containerRef}>
              <MonacoEditor
                automaticLayout={true}
                language={lang}
                theme={editorOptions.theme}
                value={code}
                options={editorOptions}
                editorDidMount={handleEditorDidMount}
                onChange={editorOnChange}
              />
            </div>
          </div>
        </Resizable>

        <div className={styles.sidebar}>
          <SideDrawer
            input={input}
            output={output}
            videoChat={videoChat}
            runCodeDisabled={runCodeDisabled}
            lang={lang}
            videoSocket={videoSocket}
            handleLang={handleLang}
            handleRun={handleRun}
            handleInput={handleInput}
            handleVideoChat={handleVideoChat}
            theme={theme}
            fontSize={fontSize}
            toggleTheme={toggleTheme}
            increaseFont={increaseFont}
            decreaseFont={decreaseFont}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorComponent;
