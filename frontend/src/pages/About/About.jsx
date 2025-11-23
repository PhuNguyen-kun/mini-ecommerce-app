import AboutHero from './sections/AboutHero';
import RadicalTransparency from './sections/RadicalTransparency';
import FactoriesSection from './sections/FactoriesSection';
import FullWidthImage from './sections/FullWidthImage';
import QualitySection from './sections/QualitySection';
import PricesSection from './sections/PricesSection';
import ExploreSection from './sections/ExploreSection';
import factoryFullWidth from '../../assets/about/factory-fullwidth.png';
import qualityFullWidth from '../../assets/about/quality-fullwidth.png';

const About = () => {
  return (
    <div className="bg-white w-full">
      {/* Hero Section */}
      <AboutHero />

      {/* Radical Transparency Text */}
      <RadicalTransparency />

      {/* Factories Section */}
      <FactoriesSection />

      {/* Full Width Image 1 */}
      <FullWidthImage
        src={factoryFullWidth}
        alt="Factory Image"
        height="637px"
      />

      {/* Quality Section */}
      <QualitySection />

      {/* Full Width Image 2 */}
      <FullWidthImage
        src={qualityFullWidth}
        alt="Quality Image"
        height="560px"
      />

      {/* Prices Section */}
      <PricesSection />

      {/* Explore Section */}
      <ExploreSection />
    </div>
  );
};

export default About;
