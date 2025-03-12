
import MainLayout from './layouts/MainLayout';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PhotoWall from './components/PhotoWall';

function Root() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<MainLayout />} />
      <Route path="/wall" element={<PhotoWall />} />
    </Routes>
  </BrowserRouter>
  );
}

export default Root;