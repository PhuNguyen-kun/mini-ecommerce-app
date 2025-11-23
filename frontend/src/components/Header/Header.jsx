import { useLocation } from 'react-router-dom';
import TopBar from './TopBar/TopBar';
import MainNav from './MainNav/MainNav';
import SubNav from './SubNav/SubNav';
import AboutSubNav from './AboutSubNav/AboutSubNav';

export default function Header() {
  const location = useLocation();
  const isAboutPage = location.pathname === '/about';

  return (
    <header className="w-full">
      <TopBar />
      <MainNav />
      {isAboutPage ? <AboutSubNav /> : <SubNav />}
    </header>
  );
}
