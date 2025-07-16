import React from 'react';
import { useNavigate } from 'react-router-dom';
import SliderModal from '../components/SliderModal';

const SliderPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <SliderModal startId={0} onClose={() => navigate('/gallery')} />
  );
};

export default SliderPage;
