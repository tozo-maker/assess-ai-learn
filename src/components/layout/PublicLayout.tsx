
import Header from './Header';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      {children}
    </div>
  );
};

export default PublicLayout;
