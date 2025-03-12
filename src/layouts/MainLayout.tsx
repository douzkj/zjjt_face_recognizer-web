import { Row, Col } from 'antd';
import VideoPlayer from '../components/VideoPlayer';
import ControlBar from '../components/ControlBar';
import DataTabs from '../components/DataTabs';


import { useEffect } from 'react';
import { useTaskStore } from '../stores/taskStore';

export default () => {
  const { taskId,recongCnt, setRecongCnt } = useTaskStore();

  // 初始化加载当前任务ID
  // useEffect(() => {
  //   const fetchTaskId = async () => {
  //     try {
  //       const res = await fetch(`${import.meta.env.VITE_API_BASE}/face-recong-man/get_cur_collect_task_id`);
  //       const { task_id } = await res.json();
  //       if (task_id) setTaskId(task_id);
  //     } catch (error) {
  //       console.error('获取任务ID失败:', error);
  //       setTaskId(null);
  //     }
  //   };
    
  //   fetchTaskId();
  // }, []);

  useEffect(() => {
    const fetchTaskId = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/face-recong-man/get_cur_collect_task_id`);
        const data = await res.json();
        
        // 确保接口返回字段正确
        if (data?.task_id) {
          console.info("----------------:" + data.task_id )
          useTaskStore.getState().setTaskId(data.task_id);
        } else {
          console.info("---------------clearTaskId-:" + data.task_id )
          useTaskStore.getState().clearTaskId();
        }
      } catch (error) {
        console.error('初始化任务ID失败:', error);
        useTaskStore.getState().clearTaskId();
      }

      
    };
    
    fetchTaskId();
    // if(taskId)
    //   console.info("----------------fetchRecongCnt start, id:" + taskId )
    //   fetchRecongCnt();

  }, []);

  // 获取识别数量的方法
  const fetchRecongCnt = async () => {
    if (!taskId) return;
    
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/face-recong-man/qry_task_recong_visitor_num/${taskId}`
      );
      
      if (!res.ok) throw new Error('请求失败');
      
      const data = await res.json();
      
      if (typeof data?.recong_cnt === 'number') {
        setRecongCnt(data.recong_cnt);
      } else {
        console.warn('接口返回数据格式异常');
      }
    } catch (error) {
      console.error('获取识别数量失败:', error);
    }
  };

  // 定时任务
  useEffect(() => {
    const timer = setInterval(fetchRecongCnt, 10000);
    if(taskId)
      console.info("----------------fetchRecongCnt start, id:" + taskId )
      // 立即执行一次
      fetchRecongCnt();
    
    return () => clearInterval(timer);
  }, [taskId]); // taskId变化时重新创建定时器

  return (
    <Row gutter={[24, 24]} style={{ height: 'calc(100vh - 48px)', padding: 24 }}>
      <Col xs={24} md={16} lg={16} style={{ height: '100%' }}>
      <div className="panel-container" style={{ 
        height: '70%',
        display: 'flex', 
        flexDirection: 'column'
      }}>
          <div className="panel-title">实时视频监控</div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <VideoPlayer />
          </div>
        </div>
        
        <div className="panel-container" style={{ height: '30%', marginTop: 24 }}>
          <div className="panel-title">采集控制台</div>
          <ControlBar  visitors={recongCnt}/>
        </div>
      </Col>

      <Col xs={24} md={8} lg={8} style={{ height: '100%' }}>
        <div className="panel-container" style={{ height: '100%' }}>
          <div className="panel-title">访客数据看板</div>
          <DataTabs />
        </div>
      </Col>
    </Row>
  );
};
