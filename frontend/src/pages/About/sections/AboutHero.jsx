import aboutHero from '../../../assets/about-hero.png';

const AboutHero = () => {
  return (
    <div className="relative w-full h-[691px] flex items-center justify-center overflow-hidden">
      <img
        src={aboutHero}
        alt="About Hero"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="relative z-10 text-white text-center max-w-[488px] px-4">
        <h1 className="text-[70px] leading-[84px] mb-4 font-normal">
          <div>We believe</div>
          <div>we can all make</div>
          <div>a difference.</div>
        </h1>
        <p className="text-2xl leading-[33.24px]">
          <div>Our way: Exceptional quality.</div>
          <div>Ethical factories. Radical Transparency.</div>
        </p>
      </div>
    </div>
  );
};

export default AboutHero;
