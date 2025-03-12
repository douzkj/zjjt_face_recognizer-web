import {  useState } from 'react';
import { Button, InputNumber, Space, App } from 'antd';
import { PauseCircleOutlined, PlayCircleOutlined, UserOutlined } from '@ant-design/icons';
import VisitorModal from './VisitorModal';
import { useTaskStore } from '../stores/taskStore';


const RTSP_PULL_URL = import.meta.env.VITE_RTSP_URL


interface ControlBarProps {
  visitors: number;
}

export default ({ visitors }: ControlBarProps) => {
  const { message } = App.useApp();
  const { taskId, setTaskId } = useTaskStore();
  const [frequency, setFrequency] = useState(5);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false); // 添加加载状态

  // 直接使用 taskId 判断状态
  const isCollecting = !!taskId;

  // 开始采集逻辑
  const handleStart = async () => {
    try {
      setLoading(true); // 开始加载
      // 读取采集频率和 RTSP_URL
      const capPeriod = frequency;

      console.info("------------url:" + RTSP_PULL_URL);

      // 组成 JSON 数据
      const postData = {
        cap_period: capPeriod,
        rtsp_url: RTSP_PULL_URL
      };

      // 发起 POST 请求
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/cap/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      });

      if (!res.ok) {
        throw new Error('网络响应不正常');
      }
      
      const { task_id } = await res.json();
      console.info("------------url end:" + task_id);
      setTaskId(task_id); // 更新全局状态
    } catch (error) {
      console.error('启动采集失败:', error);
    } finally {
      setLoading(false); // 结束加载
    }
  };

  // 停止采集逻辑
  const handleStop = async () => {
    try {
      setLoading(true); // 开始加载 
      await fetch(`${import.meta.env.VITE_API_BASE}/cap/stop/${taskId}`, { method: 'POST' });
      setTaskId(null); // 清除全局状态
    } catch (error) {
      console.error('停止采集失败:', error);
      message.error('停止采集失败');
    }finally {
      setLoading(false); // 结束加载
    }
  };

  return (
    <Space size="middle" className="control-bar">
      <Button 
        type={isCollecting ? "default" : "primary"}
        className="visitor-btn"
        disabled={loading}
        onClick={isCollecting ? handleStop : handleStart}
        icon={isCollecting ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
      >
        {isCollecting ? '停止采集' : '开始采集'}
      </Button>

      <Button 
        onClick={() => setModalVisible(true)}
        icon={<UserOutlined />}
        className="visitor-btn"
      > 
        访客上屏（{visitors}人）
      </Button>

      <VisitorModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />


    <InputNumber
        addonBefore="采集频率"
        addonAfter="秒"
        className="frequency-input"
        min={1}
        max={60}
        value={frequency}
        onChange={v => setFrequency(v || 5)}
      />
    </Space>
  );
};