import image1 from '../../../assets/blogpost/content-1.png';
import image2 from '../../../assets/blogpost/content-2.png';

const BlogContent = () => {
  return (
    <>
      {/* Image Section 1 */}
      <div className="px-[60px] py-[100px] flex justify-center">
        <img 
          src={image1} 
          alt="Winter white outfit" 
          className="w-[790px] h-[1054px] object-cover"
        />
      </div>

      {/* Text Content Section 1 */}
      <div className="px-[228px] py-[100px]">
        <h2 className="text-[40px] leading-[48px] font-semibold text-black mb-11">
          Nail the Classics
        </h2>
        <p className="text-2xl leading-[33px] text-black mb-11">
          Do pure winter chic with a <a href="#" className="underline">classic cashmere white sweater</a>. Made in the softest cashmere, it's a sweater that will last season after season. Effortlessly elevating any winter outfit, a white sweater is a must for any capsule collection. Just <a href="#" className="underline">sure you keep it clean and stain free</a>, to maintain that clean, polished look. Pair it with dark jeans or <a href="#" className="underline">Utility Barrel</a> pants for a casual yet refined ensemble, or layer it over a collared shirt for a preppy touch.
        </p>

        <h2 className="text-[40px] leading-[48px] font-semibold text-black mb-11">
          Monochromatic Magic
        </h2>
        <p className="text-2xl leading-[33px] text-black mb-11">
          Nothing feels more luxe than an all-white winter outfit. And the best part? You don't have to break the bank to create a super chic top-to-toe look. Pair classic <a href="#" className="underline">corduroy pants</a> in a modern wide-legged silhouette with a relaxed <a href="#" className="underline">Oxford style white shirt</a> for a mix-and-match texture play.<br/><br/>
          Extra points if you add a <a href="#" className="underline">white blazer</a>, <a href="#" className="underline">cardigan</a>, or <a href="#" className="underline">sweater</a>. Accessorize with subtle metallic accents or a bold red lip for a pop of color, letting your outfit take center stage.
        </p>

        <h2 className="text-[40px] leading-[48px] font-semibold text-black mb-11">
          Keep Warm in White
        </h2>
        <p className="text-2xl leading-[33px] text-black">
          Stay warm all winter long with a <a href="#" className="underline">white puffer jacket</a> puffer jacket. This durable, cold weather jacket is puffed-up for extra warmth, giving an on-point blown out silhouette. A white coat not only stands out against the sea of dark winter jackets but also provides a fun canvas for experimenting with textures and patterns. Throw on a white coat over a neutral-toned outfit for an easy elegant look.
        </p>
      </div>

      {/* Image Section 2 */}
      <div className="px-[60px] py-[100px] flex justify-center">
        <img 
          src={image2} 
          alt="Winter white layers" 
          className="w-[790px] h-[1054px] object-cover"
        />
      </div>

      {/* Text Content Section 2 */}
      <div className="px-[228px] py-[100px]">
        <h2 className="text-[40px] leading-[48px] font-semibold text-black mb-11">
          Textures and Layers
        </h2>
        <p className="text-2xl leading-[33px] text-black mb-11">
          Winter fashion is all about layering, and white outfits provide the perfect base for playing with textures and layers. Start with your <a href="#" className="underline">white turtleneck</a> and experiment with different fabrics like wool, cashmere, and silk to add depth and interest to your look. A <a href="#" className="underline">white silk blouse</a> layered under a chunky knit sweater or a white wool skirt paired with a <a href="#" className="underline">turtleneck</a> creates a textural look that's both cozy and chic.
        </p>

        <h2 className="text-[40px] leading-[48px] font-semibold text-black mb-11">
          Accessorize with Neutrals
        </h2>
        <p className="text-2xl leading-[33px] text-black">
          When working with a predominantly white palette, neutrals become your best friends. From <a href="#" className="underline">white leather Chelsea boots</a> to <a href="#" className="underline">off-white beanies</a> mix in plenty of winter-ready accessories and shoes for those finishing outfit tonal touches.<br/><br/>
          So, step into the season with confidence, and let your winter whites make a bold and beautiful statement. Shop our <a href="#" className="underline">winter white edit here</a>.
        </p>
      </div>
    </>
  );
};

export default BlogContent;
