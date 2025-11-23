const FullWidthImage = ({ src, alt, height = "637px" }) => {
  return (
    <div className="w-full relative" style={{ height }}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default FullWidthImage;
