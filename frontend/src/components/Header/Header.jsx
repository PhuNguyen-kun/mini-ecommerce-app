import { useLocation } from "react-router-dom";
import TopBar from "./TopBar/TopBar";
import MainNav from "./MainNav/MainNav";
import SubNav from "./SubNav/SubNav";
import AboutSubNav from "./AboutSubNav/AboutSubNav";

export default function Header() {
  const location = useLocation();
  const isAboutPage = location.pathname === "/about";
  const isStoresPage = location.pathname === "/stores";
  const isBlogPage = location.pathname === "/blog";
  const isBlogPostPage = location.pathname === "/blog-post";
  const isWomenPage = location.pathname === "/women";
  const isMenPage = location.pathname === "/men";
  const showAboutSubNav = isAboutPage || isStoresPage;

  const showSubNav =
    !showAboutSubNav &&
    !isBlogPage &&
    !isBlogPostPage &&
    !isWomenPage &&
    !isMenPage;

  return (
    <header className="w-full sticky top-0 z-50 bg-white">
      {/* <TopBar /> */}
      <MainNav />
      {showAboutSubNav && <AboutSubNav />}
      {showSubNav && <SubNav />}
    </header>
  );
}
