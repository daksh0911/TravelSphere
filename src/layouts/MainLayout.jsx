import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FooterReveal from '../components/layout/FooterReveal';
import BackToTop from '../components/common/BackToTop';

const MainLayout = () => {
  return (
    <div className="main-layout">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navbar />
      <main id="main-content" tabIndex={-1} style={{ paddingTop: '80px', minHeight: 'calc(100vh - 400px)' }}>
        <Outlet />
      </main>
      <FooterReveal><Footer /></FooterReveal>
      <BackToTop />
    </div>
  );
};

export default MainLayout;
