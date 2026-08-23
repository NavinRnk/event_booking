import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-page__code">404</div>
      <p className="text-muted">That page does not exist.</p>
      <Button onClick={() => navigate('/')}>Back to Events</Button>
    </div>
  );
};

export default NotFound;
