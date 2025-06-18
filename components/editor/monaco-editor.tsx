// components/CodeSessionEditor.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import * as signalR from '@microsoft/signalr';

import { Button } from "@/components/ui/button";

import type * as monacoType from 'monaco-editor';

import axios from 'axios';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

type CodeChange = {
  range: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
  text: string;
};

type SaveStatus = 'saved' | 'saving' | 'error' | null;

const LANGUAGES = [
  { label: 'TypeScript', value: 'typescript' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'C#', value: 'csharp' },
  { label: 'Java', value: 'java' },
  { label: 'HTML', value: 'html' },
  { label: "C", value: 'c'},
  { label: "C++", value: 'cpp'}
];


export default function CodeSessionEditor({serverId = '0', channelId = '0'}) {
  const [connected, setConnected] = useState(false);
  //const [sessionId, setSessionId] = useState('');
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const editorRef = useRef<import('monaco-editor').editor.IStandaloneCodeEditor | null>(null);
  const pendingCodeRef = useRef<{code: string, language: string} | null>(null);
  // Флаг, чтобы не зациклить обновления при programmatic setValue
  const suppressRef = useRef(false);
  const monacoRef = useRef<typeof monacoType | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(null);
  const [language, setLanguage] = useState('typescript');
  const languageRef = useRef(language);

  // Синхронизация языка с другими участниками
  const handleLanguageChange = async (lang: string) => {
    setLanguage(lang);
    if (connectionRef.current) {
      await connectionRef.current.invoke('SendLanguageChange', serverId, channelId, lang);
    }
  };

  // Автосохранение каждые 30 сек
  useEffect(() => {
    const interval = setInterval(() => {
      handleSave();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    languageRef.current = language;
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (editor && monaco) {
      const model = editor.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  const handleBeforeMount = (monaco: typeof monacoType) => {
    monacoRef.current = monaco;
  };

  
  // Инициализация SignalR при подключении
  const connectToSession = async () => {
    //if (!sessionId.trim()) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5207/codeHub')
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection as any;

    // При получении обновлений кода от сервера
    connection.on("ReceiveCodeDelta", (changes: CodeChange[]) => {
      const editor = editorRef.current;
      const model = editor?.getModel();
      const monaco = monacoRef.current;

      if (editor && model && monaco) {
        suppressRef.current = true;

        const operations = changes.map(change => ({
          range: new monaco.Range(
            change.range.startLineNumber,
            change.range.startColumn,
            change.range.endLineNumber,
            change.range.endColumn
          ),
          text: change.text,
          forceMoveMarkers: true
        }));

        model.pushEditOperations([], operations, () => null);
        suppressRef.current = false;
      }
    });


    try {
      await connection.start();
      console.log('SignalR Connected!');

      await connection.invoke('JoinCodeSession', serverId, channelId);

      const users: string[] = await connection.invoke("GetSessionUsers", serverId, channelId);

      if (users.length <= 1) {
        // Я первый → загружаем код с бэка
        console.log("requesting code from server");
        axios.get(`http://localhost:5207/api/code/fromServer/${serverId}/${channelId}`)
          .then(res => {
            const editor = editorRef.current;
            if (editor) {
              editor.setValue(res.data.text);
              setLanguage(res.data.language);
            }
            else {
              var huinya : {code: string, language: string} = {code: res.data.text as string, language: res.data.language as string};
              pendingCodeRef.current = huinya;
            }
          });
      } else {
        // Я не первый → прошу синхронизацию у других
        console.log("requesting code from client");
        connection.invoke("RequestSyncCode", serverId, channelId);
      }

      connection.on("SyncCodeTo", (requesterConnectionId: string) => {
        const code = editorRef.current?.getValue();
        connection.invoke("SendFullCodeTo", requesterConnectionId, code, languageRef.current);
      });

      connection.on("ReceiveSyncCode", (gotCode: string, gotLanguage: string) => {
        const editor = editorRef.current;
        if (editor) {
          editor.setValue(gotCode);
          setLanguage(gotLanguage);
        }
        else {
          var huinya : {code: string, language: string} = {code: gotCode, language: gotLanguage};
          pendingCodeRef.current = huinya;
        }
      });

      connection.on("ReceiveLanguageChange", (lang: string) => {
        setLanguage(lang);
      });


      setConnected(true);
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };

  // Отключение при unmount
  useEffect(() => {
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop().catch(console.error);
      }
    };
  }, []);

  // Функция при монтировании редактора
  const handleEditorMount = (editor: import('monaco-editor').editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;

    if (pendingCodeRef.current !== null) {
      console.log("pending ", pendingCodeRef.current);
      editor.setValue(pendingCodeRef.current.code);
      setLanguage(pendingCodeRef.current.language);
      pendingCodeRef.current = null;
    }

    // Отправляем полный текст на сервер при любом локальном изменении
    editor.onDidChangeModelContent((event) => {
      if (connectionRef.current && !suppressRef.current) {
        const changes = event.changes.map(change => ({
          range: {
            startLineNumber: change.range.startLineNumber,
            startColumn: change.range.startColumn,
            endLineNumber: change.range.endLineNumber,
            endColumn: change.range.endColumn
          },
          text: change.text
        }));

        connectionRef.current.invoke("SendCodeDelta", serverId, channelId, changes).catch(console.error);
      }
    });

  };

  const handleSave = async () => {
    const code = editorRef.current?.getValue();
    if (!code) return;
    console.log("On Saving: Code = ", code)

    setSaveStatus('saving');

    try {
      await axios.post('http://localhost:5207/api/code/save', {
        serverId,
        channelId,
        text: code,
        language
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error("Ошибка сохранения:", err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };
  

  return (
    <div className="p-4">
      {!connected ? (
        <div className="space-x-2">
          {/* <input
            type="text"
            placeholder="ID сессии"
            className="border rounded px-2 py-1"
            value={sessionId}
            onChange={e => setSessionId(e.target.value)}
          /> */}
          <Button
            onClick={connectToSession}
            className="bg-blue-600 text-white px-4 py-1 rounded"
          >
            Подключиться к сессии
          </Button>
        </div>
      ) : (
        
        <div className="flex flex-col h-screen">
          <div className="p-2 flex items-center gap-4 bg-gray-900 text-white">
            

              <label>Язык:</label>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="text-black px-2 py-1 rounded"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              
              <button onClick={handleSave} className="bg-blue-600 px-4 py-1 rounded hover:bg-blue-700">
                💾 Сохранить
              </button>
              {saveStatus === 'saving' && <span className="text-yellow-400">Сохраняется...</span>}
              {saveStatus === 'saved' && <span className="text-green-400">Сохранено ✅</span>}
              {saveStatus === 'error' && <span className="text-red-400">Ошибка ❌</span>}
          </div>

          <MonacoEditor
            height="100%"
            defaultLanguage={language}
            defaultValue="// Начните писать код..."
            theme="vs-dark"
            onMount={handleEditorMount}
            beforeMount={handleBeforeMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              automaticLayout: true,
            }}
          />
        </div>
      )}
    </div>
  );
}
