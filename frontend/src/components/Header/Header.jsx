import TopBar from './TopBar/TopBar';
import MainNav from './MainNav/MainNav';
import SubNav from './SubNav/SubNav';

export default function Header() {
  return (
    <header className="w-full">
      <TopBar />
      <MainNav />
      <SubNav />
    </header>
  );
}
