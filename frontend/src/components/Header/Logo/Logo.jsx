import logoImage from '../../../assets/logo.svg';

export default function Logo() {
  return (
    <div className="flex items-center">
      <img src={logoImage} alt="Logo" className="h-6" />
    </div>
  );
}
