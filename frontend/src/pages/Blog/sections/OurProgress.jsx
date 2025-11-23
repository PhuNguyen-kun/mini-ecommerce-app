import progress1 from '../../../assets/blog/progress-1.png';
import progress2 from '../../../assets/blog/progress-2.png';
import progress3 from '../../../assets/blog/progress-3.png';

const ProgressCard = ({ image, title }) => (
  <div className="flex-1 flex flex-col gap-3">
    <div className="w-full h-[306px]">
      <img src={image} alt={title} className="w-full h-full object-cover" />
    </div>
    <p className="text-[32px] leading-10 text-black">{title}</p>
  </div>
);

const OurProgress = () => {
  const progressItems = [
    { image: progress1, title: 'Carbon Commitment' },
    { image: progress2, title: 'Environmental Initiatives' },
    { image: progress3, title: 'Better Factories' },
  ];

  return (
    <div className="w-full px-[60px] py-[120px]">
      <h2 className="text-[54px] leading-[72px] font-semibold text-black mb-3">
        Our Progress
      </h2>
      <div className="flex gap-6 w-full">
        {progressItems.map((item, index) => (
          <ProgressCard key={index} {...item} />
        ))}
      </div>
    </div>
  );
};

export default OurProgress;
