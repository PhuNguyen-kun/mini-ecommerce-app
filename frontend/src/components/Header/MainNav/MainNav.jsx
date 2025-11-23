import Logo from '../Logo/Logo';
import NavActions from '../NavActions/NavActions';

export default function MainNav() {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <div className="flex items-center gap-6">
        <div className="px-3 py-2 cursor-pointer hover:opacity-70">
          <p className="text-sm font-medium">Women</p>
        </div>
        <div className="relative px-3 py-2 cursor-pointer">
          <p className="text-sm font-medium">Men</p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
        </div>
        <div className="px-3 py-2 cursor-pointer hover:opacity-70">
          <p className="text-sm font-medium">About</p>
        </div>
        <div className="px-3 py-2 cursor-pointer hover:opacity-70">
          <p className="text-sm font-medium">Everworld Stories</p>
        </div>
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2">
        <Logo />
      </div>

      <NavActions />
    </div>
  );
}
