export default function AboutSubNav() {
  const navItems = [
    'About',
    'Stores',
    'Factories',
    'Environmental Initiatives',
    'Our Carbon Commitment',
    'Annual Impact Report',
    'Cleaner Fashion',
  ];

  return (
    <div className="flex items-center justify-center gap-6 px-6 py-5 border-b border-gray-200">
      {navItems.map((item, index) => (
        <div key={index} className="cursor-pointer hover:opacity-70">
          <p className="text-xs text-gray-700">{item}</p>
        </div>
      ))}
    </div>
  );
}
