import { Tabs, Table, Tag, Avatar, Modal, Image } from 'antd';
import type { TabsProps, TableColumnsType } from 'antd';
import { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import VisitorModal from './VisitorModal';

interface CollectionRecord {
  id: string;
  task_id: string;
  create_time: string;
  end_time: string;
  status: 1 | 2;
  idt_cnt: number;
}

interface VisitorInfo {
  user_id: string;
  visit_cnt: number;
  first_visit_time: string;
  last_visit_time: string;
  first_face_img_path: string;
}

interface EnhanceImageInfo {
  original_face_image:string;
  enhance_face_image: string;
  face_time:string;
}


const API_BASE = import.meta.env.VITE_API_BASE;

export default () => {
  const [loading, setLoading] = useState(false);
  const [collectionData, setCollectionData] = useState<CollectionRecord[]>([]);
  const [visitorData, setVisitorData] = useState<VisitorInfo[]>([]);
  const [enhanceImageData, setEnhanceImageData] = useState<EnhanceImageInfo[]>([]);
  const [error, setError] = useState<string>('');
  const [historyImages, setHistoryImages] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentTaskId, setCurrentTaskId] = useState<string>('');
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // 采集记录列定义
  const collectionColumns: TableColumnsType<CollectionRecord> = [
    {
      title: '采集时间',
      dataIndex: 'create_time',
      key: 'create_time',
      render: (text) => new Date(text).toLocaleString()
    },
    {
      title: '结束时间',
      dataIndex: 'end_time',
      key: 'end_time',
      render: (text) => text ? new Date(text).toLocaleString() : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'volcano'}>
          {status === 1 ? '执行中' : '已停止'}
        </Tag>
      )
    },
    {
      title: '访客人数',
      dataIndex: 'idt_cnt',
      key: 'idt_cnt',
      align: 'right',
      render: (text, record) => (
        <span
          onClick={() => {
            if (text) {
              setCurrentTaskId(record.task_id);
              setModalVisible(true);
            }
          }}
        >
          {text}
        </span>
      )
    }
  ];

  // 访客清单列定义
  const visitorColumns: TableColumnsType<VisitorInfo> = [
    {
      title: '访客头像',
      dataIndex: 'first_face_img_path',
      key: 'avatar',
      width: 100,
      render: (path) => (
        <div className="avatar-cell">
          <Image 
            src={`${API_BASE}/visitor-images${path}`}
            className="table-avatar"
            preview={{
              mask: false 
            }}
          >
            <span className="avatar-fallback">访客</span>
          </Image>
        </div>
      )
    },
    {
      title: '访问次数',
      dataIndex: 'visit_cnt',
      key: 'visit_count',
      align: 'center',
      sorter: (a, b) => a.visit_cnt - b.visit_cnt,
      render: (visitCnt, record) => (
        <span onClick={() => fetchVisitorHistory(record.user_id)}>
          {visitCnt}
        </span>
      )
    },
    {
      title: '首次访问',
      dataIndex: 'first_visit_time',
      key: 'first_visit',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '最近访问',
      dataIndex: 'last_visit_time',
      key: 'last_visit',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm')
    }
  ];

  // 图像增强列定义
  const faceEnhanceColumns: TableColumnsType<EnhanceImageInfo> = [
    {
      title: '原始头像',
      dataIndex: 'original_face_image',
      key: 'avatar',
      width: 100,
      render: (path) => (
        <div className="avatar-cell">
          <Image 
            src={`${API_BASE}/visitor-images${path}`}
            className="table-avatar"
            preview={{
              // zoom: 1.5,
              // rotate: true,
              mask: false
            }}
          >
            <span className="avatar-fallback">访客</span>
          </Image>
        </div>
      )
    },
    {
      title: '增强图片',
      dataIndex: 'enhance_face_image',
      key: 'avatar',
      width: 100,
      render: (path) => (
        <div className="avatar-cell">
          <Image 
            src={`${API_BASE}/visitor-images${path}`}
            className="table-avatar"
            preview={{
              mask: false 
            }}
          >
            <span className="avatar-fallback">访客</span>
          </Image>
        </div>
      )
    },
    {
      title: '时间',
      dataIndex: 'face_time',
      key: 'last_visit',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm')
    }
  ];

  // 获取访客历史照片数据
  const fetchVisitorHistory = async (userId: string) => {
    try {
      setLoading(true);
      const { data } = await axios.get<{ data: string }>(
        `${API_BASE}/face-recong-man/qry_visitor_history_img/${userId}`
      );
      const parsedData = JSON.parse(data.data);
      if (Array.isArray(parsedData)) {
        setHistoryImages(parsedData);
        setCurrentUserId(userId);
        setHistoryModalVisible(true);
      } 
    } catch (err) {
      setError('获取历史照片数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 渲染历史照片弹窗
  const renderHistoryImages = () => {
    if (!historyImages || historyImages.length === 0) {
      return <div>暂无历史照片</div>;
    }

    // 每行最多显示5张照片
    const rows: any[][] = [];
    for (let i = 0; i < historyImages.length; i += 5) {
      rows.push(historyImages.slice(i, i + 5));
    }

    return rows.map((row, rowIndex) => (
      <div key={rowIndex} style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
        {row.map((img, imgIndex) => (
          <div key={imgIndex} style={{ margin: '0 10px' }}>
            <img
              src={`${API_BASE}/visitor-images${img.face_img_path}`}
              alt="访客照片"
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
            />
            <div>{dayjs(img.face_identy_time).format('YYYY-MM-DD HH:mm')}</div>
          </div>
        ))}
      </div>
    ));
  };

  // 加载采集记录数据
  const loadCollectionData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get<{ data: string }>(
        `${API_BASE}/face-recong-man/task-detail-list`
      );
      const parsedData: CollectionRecord[] = JSON.parse(data.data);
      if (Array.isArray(parsedData)) {
        setCollectionData(parsedData);
      } else {
        setCollectionData([]);
      }
    } catch (err) {
      setError('数据加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 加载访客数据
  const loadVisitorData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get<{ data: string }>(
        `${API_BASE}/face-recong-man/visitor-list`
      );
      const parsedData: VisitorInfo[] = JSON.parse(data.data);
      if (Array.isArray(parsedData)) {
        setVisitorData(parsedData);
      } else {
        setVisitorData([]);
      }
    } catch (err) {
      console.error('解析错误:', err);
    } finally {
      setLoading(false);
    }
  };

  // 加载增强图像数据
  const loadEnhanceImages = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get<{ data: string }>(
        `${API_BASE}/face-recong-man/enhance-images`
      );
      const parsedData: EnhanceImageInfo[] = JSON.parse(data.data);
      if (Array.isArray(parsedData)) {
        setEnhanceImageData(parsedData);
      } else {
        setEnhanceImageData([]);
      }
    } catch (err) {
      console.error('解析错误:', err);
    } finally {
      setLoading(false);
    }
  };


  const items: TabsProps['items'] = [
    {
      key: '1',
      label: '采集记录',
      children: (
        <Table
          columns={collectionColumns}
          dataSource={collectionData}
          loading={loading}
          pagination={{ pageSize: 8 }}
          rowKey="id"
          onExpand={loadCollectionData}
        />
      )
    },
    {
      key: '2',
      label: '访客清单',
      children: (
        <Table
          columns={visitorColumns}
          dataSource={visitorData}
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowKey="id"
          onExpand={loadVisitorData}
        />
      )
    },
    {
      key: '3',
      label: '图像增强',
      children: (
        <Table
          columns={faceEnhanceColumns}
          dataSource={enhanceImageData}
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowKey="id"
          onExpand={loadEnhanceImages}
        />
      )
    }
  ];

  useEffect(() => {
    loadCollectionData();
  }, []);

  return (
    <div className="data-board">
      {error && <div className="error-tip">{error}</div>}
      <Tabs
        defaultActiveKey="1"
        items={items}
        tabBarStyle={{ padding: '0 16px' }}
        onChange={(key) => {
          if (key === '1') loadCollectionData();
          if (key === '2') loadVisitorData();
          if (key === '3') loadEnhanceImages();
        }}
      />
      <VisitorModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        taskId={`${currentTaskId}`}
      />
      
      {/* 历史照片弹窗 */}
      <Modal
        title={`访客 ${currentUserId} 的历史照片`}
        visible={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={null}
        width={800}
      >
        {renderHistoryImages()}
      </Modal>
    </div>
  );
};