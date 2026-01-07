import logoImage from "../../../assets/Logo.svg";

export default function Logo() {
  return (
    <div className="flex items-center justify-center">
      <img src={logoImage} alt="Logo" className="h-4 sm:h-5 md:h-6 lg:h-7 w-auto" />
    </div>
  );
}
