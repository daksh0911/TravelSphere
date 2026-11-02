import ContactSection from '../Home/ContactSection';

import usePageTitle from '../../../hooks/usePageTitle';
const ContactPage = () => {
  usePageTitle('Contact');
  return (
    <div className="contact-page">
      <ContactSection />
    </div>
  );
};

export default ContactPage;
