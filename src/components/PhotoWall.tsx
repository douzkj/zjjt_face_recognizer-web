import { useEffect, useState } from 'react';
import {  Skeleton } from 'antd';
import dayjs from 'dayjs';
import '../styles/components/PhotoWall.scss';

interface VisitorPhoto {
  id: number;
  user_id: string;
  face_img_path: string;
  visit_cnt: number;
}

const API_BASE = import.meta.env.VITE_API_BASE;
export default () => {
  const [photos, setPhotos] = useState<VisitorPhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(dayjs());

  // 加载照片数据
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const res = await fetch(`${API_BASE}/face-recong-man/visitor-wall-screen`);
        const data = await res.json();
        setPhotos(data);
      } catch (error) {
        console.error('加载照片墙数据失败:', error);
      }
    };
    
    loadPhotos();
  }, []);

  // 实时时间更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 轮播控制
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % photos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [photos.length]);

  return (
    <div className="dashboard">
      <div className="header">
        <h1 className="title">智能访客监控系统</h1>
        <div className="time-box">
          {currentTime.format('YYYY-MM-DD HH:mm:ss')}
        </div>
      </div>

      <div className="main-content">
        <div className="display-area">
          <h2>访客照片墙</h2>
          <div className="photo-wall">
            <div 
              className="carousel-track"
              style={{ transform: `translateX(-${currentIndex * 33.33}%)` }}
            >
              {photos.length > 0 ? (
                photos.map(photo => (
                  <div key={photo.id} className="photo-item">
                    <img
                      src={`${API_BASE}/visitor-images${photo.face_img_path}`} 
                      className="visitor-photo" 
                    />
                    <div className="visit-info">
                      <div className="visit-count">访问次数: {photo.visit_cnt}</div>
                    </div>
                  </div>
                ))
              ) : (
                <Skeleton active paragraph={{ rows: 4 }} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};