import { useRef, useState } from 'react';
import { Button, message } from 'antd';

const API_BASE = import.meta.env.VITE_WEBRTC_GW_API_BASE || 'http://10.1.28.100:28001/api';
const RTSP_URL = import.meta.env.VITE_RTSP_URL || 'rtsp://admin:Hangzhou@1357@10.1.28.230:554/Streaming/Channels/101'

export default () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      bundlePolicy: 'max-bundle'
    });

    pc.addTransceiver('video', { direction: 'recvonly' });
    
    pc.ontrack = (event) => {
      if (videoRef.current) {
        console.info("---------------videoRef");
        videoRef.current.srcObject = event.streams[0];
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected') {
        handleStop();
      }
    };

    return pc;
  };

  const handleStart = async () => {

    try {
      message.loading('Starting stream...', 0);
      
      // 1. 启动转推任务
      const startRes = await fetch(`${API_BASE}/stream-manage-gw/start-pull-trans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stream_url: RTSP_URL })
      });

      if (!startRes.ok) throw new Error('Failed to start stream');
      
      const { task_id, pull_url } = await startRes.json();
      setCurrentTaskId(task_id);

      // 2. 建立WebRTC连接
      pcRef.current = createPeerConnection();
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);

      // 3. 获取SDP应答
      const answerRes = await fetch(pull_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pcRef.current.localDescription),
      });

      const answer = await answerRes.json();
      await pcRef.current.setRemoteDescription(answer);

      message.destroy();
      message.success('Stream started');
    } catch (error) {
      message.destroy();
      message.error(`Start failed: ${error}`);
      handleStop();
    }
  };

  const handleStop = async () => {
    if (!currentTaskId) return;

    try {
      await fetch(`${API_BASE}/stream-manage-gw/stop-pull-trans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: currentTaskId })
      });

      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setCurrentTaskId(null);
      message.success('Stream stopped');
    } catch (error) {
      message.error(`Stop failed: ${error}`);
    }
  };

  return (
    <div className="video-panel">
      <div className="video-container"> {/* 新增容器层 */}
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted
        />
      </div>
      <div className="controls">
        <Button 
          type="primary" 
          onClick={handleStart}
          disabled={!!currentTaskId}
        >
          Start Stream
        </Button>
        <Button 
          danger
          onClick={handleStop}
          disabled={!currentTaskId}
        >
          Stop Stream
        </Button>
      </div>
    </div>
  );
};