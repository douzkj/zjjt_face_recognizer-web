import { Modal, Grid, Checkbox, Button, Image, Spin, message, Empty } from 'antd';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTaskStore } from '../stores/taskStore';

const { useBreakpoint } = Grid;
const API_BASE = import.meta.env.VITE_API_BASE;

interface Visitor {
  id: string;
  user_id: string;
  face_img_path: string;
  show_status: number;
  visit_cnt: number;
}

interface VisitorModalProps {
  visible: boolean;
  onClose: () => void;
  taskId?: string; // 增加 taskId 参数，可选
}

export default ({ visible, onClose, taskId }: VisitorModalProps) => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const screens = useBreakpoint();

  // 初始化加载数据
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const storeTaskId = useTaskStore.getState().taskId;
      const currentTaskId = taskId || storeTaskId; // 如果传入了 taskId 就用它，否则用 store 中的 taskId

      // 调用接口获取数据
      const {data} = await axios.get<{data: string}>(
        `${import.meta.env.VITE_API_BASE}/face-recong-man/qry_visitor_task_show_info/${currentTaskId}`
      );

      // 解析接口返回的嵌套JSON数据
      const parsedData = JSON.parse(data.data);

      // 确保 parsedData 是一个数组
      let visitorList: any[] = [];

      if (Array.isArray(parsedData)) {
        visitorList = parsedData;
      } else if (typeof parsedData === 'object') {
        // 如果 parsedData 是一个对象，检查是否有 data 字段
        if (parsedData.data && Array.isArray(parsedData.data)) {
          visitorList = parsedData.data;
        } else {
          // 如果 parsedData 不是数组，直接将其包装成一个数组
          visitorList = [parsedData];
        }
      }

      // 如果 parsedData 是一个空对象，直接设置为空数组
      if (Object.keys(parsedData).length === 0) {
        visitorList = [];
      }

      // 转换数据格式并设置初始选中状态
      const formattedList = visitorList.map((item: any) => ({
        id: String(item.id), // 确保id为字符串
        user_id: item.user_id,
        face_img_path: item.face_img_path,
        show_status: item.show_status,
        visit_cnt: item.visit_cnt
      }));

      // 处理全选逻辑
      const shouldSelectAll = formattedList.every(visitor => visitor.show_status === 0);
      const initialSelected = shouldSelectAll 
        ? formattedList.map(visitor => visitor.id)
        : formattedList.filter(visitor => visitor.show_status === 1).map(visitor => visitor.id);

      setVisitors(formattedList);
      setSelectedIds(initialSelected);
    } catch (error) {
      message.error('数据解析失败');
      console.error('接口数据解析错误:', error);
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  // 提交处理逻辑
  const handleSubmit = async () => {
    try {
      // 0) 获取选中情况
      const selectedIdsSet = new Set(selectedIds);

      // 1) 根据是否选中，构造识别记录show_status的值
      const payload = visitors.map(visitor => ({
        id: visitor.id,
        show_status: selectedIdsSet.has(visitor.id) ? 1 : 0
      }));

      // 2) 调用push_identy_task_img_2_screen接口 POST调用传送上述JSON数据
      await axios.post(
        `${import.meta.env.VITE_API_BASE}/face-recong-man/push_identy_task_img_2_screen`,
        payload
      );
      
      message.success('配置更新成功');
      onClose();
    } catch (error) {
      message.error('操作失败，请重试');
    }
  };

  // 初始化数据
  useEffect(() => {
    if (visible) loadInitialData();
  }, [visible, taskId]); // 增加 taskId 到依赖数组中

  return (
    <Modal
      title="访客上屏配置"
      width={screens.xs ? '100%' : 800}
      open={visible}
      onCancel={onClose}
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
        >
          上屏
        </Button>
      ]}
    >
      <Spin spinning={loading}>
        <div className="visitor-grid">
          {visitors.length > 0 ? (
            visitors.map(visitor => (
              <div key={visitor.id} className="visitor-item">
                <Checkbox
                  checked={selectedIds.includes(visitor.id)}
                  onChange={e =>
                    setSelectedIds(prev =>
                      e.target.checked
                        ? [...prev, visitor.id]
                        : prev.filter(id => id !== visitor.id)
                    )
                  }
                >
                  <div className="visitor-content">
                    <Image
                      src={`${API_BASE}/visitor-images${visitor.face_img_path}`}
                      className="visitor-image"
                      preview={false} 
                    />
                    <div className="visit-count">
                      访问 {visitor.visit_cnt}  次
                    </div>
                  </div>
                </Checkbox>
              </div>
            ))
          ) : (
            <Empty description="暂无访客数据" />
          )}
        </div>
      </Spin>
    </Modal>
  );
};