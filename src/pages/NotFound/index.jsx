import { ArrowRight, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import './NotFound.css';

export default function NotFoundPage() {
  usePageTitle('Page not found');
  return (
    <div className="not-found">
      <div className="not-found-inner">
        <span className="not-found-eyebrow"><Compass size={14} /> Error 404</span>
        <h1>This road isn’t <em>on the map.</em></h1>
        <p>The page you’re looking for may have moved or never existed. Let’s get you back to somewhere worth going.</p>
        <div className="not-found-actions">
          <Link to="/" className="not-found-primary">Back to home <ArrowRight size={17} /></Link>
          <Link to="/destinations" className="not-found-secondary">Explore destinations</Link>
        </div>
      </div>
    </div>
  );
}
