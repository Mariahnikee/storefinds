import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag, ShoppingCart, Home } from "lucide-react";
import client from "../../client";
import { useCart } from "../../context/CartContext";

const COLOR_MAP = { White:"#fff", Black:"#1f1f1f", Pink:"#f4a7b9", Gold:"#c9a84c", Beige:"#d4b896", Brown:"#7B4F2E", Grey:"#9E9E9E", Silver:"#C0C0C0", Cream:"#FFFDD0", "Rose Gold":"#b76e79", "Navy Blue":"#001F5B", Green:"#4CAF50" };

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, itemCount } = useCart();

const openCart = () => {
  window.dispatchEvent(new CustomEvent("storefinds:open-cart"));
};
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [added, setAdded] = useState(false);
  const relatedRef = useRef(null);

  useEffect(() => {
    client.fetch(`*[_type == "shopMkProduct" && slug.current == $slug][0]{title, "slug": slug.current, price, category, description, colors, "images": images[].asset->url}`, { slug }).then(setProduct).catch(console.error);
  }, [slug]);

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedColor(product?.colors?.[0] || "");
    setAdded(false);

    if (product?.category) {
      client.fetch(`*[_type == "shopMkProduct" && defined(slug.current) && category == $category && slug.current != $slug] | order(_createdAt desc)[0...8]{title, "slug": slug.current, price, "imageUrl": images[0].asset->url}`, { category: product.category, slug: product.slug })
        .then(setRelatedProducts)
        .catch(console.error);
    }
  }, [product]);

  if (!product) return <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]"><p className="text-gray-500">Loading product...</p></div>;

  const images = product.images || [];
  const activeImage = images[currentIndex] || "";
  const cartProduct = { slug: product.slug, title: product.title, price: product.price, image: activeImage };

  const add = () => {
    addToCart(cartProduct, quantity, selectedColor);
    setAdded(true);
    setTimeout(() => relatedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
  };

  const buyNow = () => { addToCart(cartProduct, quantity, selectedColor); navigate("/checkout"); };

  return <div className="bg-[#FAF7F2] min-h-screen pt-8 sm:pt-8 pb-24 sm:pb-10 px-3 sm:px-4 md:px-6">

    {/* Desktop Product Navigation */}
    <nav className="hidden sm:flex max-w-6xl mx-auto mb-6 bg-white border border-[#E7DDD2] rounded-xl shadow-sm">
      <div className="w-full flex items-center justify-center">

        <Link
          to="/"
          className="flex items-center gap-1.5 px-6 py-3 text-sm font-medium text-[#7A7570] hover:text-[#6D213C] transition-colors"
        >
          <Home size={17} strokeWidth={1.8} />
          <span>Home</span>
        </Link>

        <Link
          to="/shop"
          className="flex items-center gap-1.5 px-6 py-3 text-sm font-medium text-[#7A7570] hover:text-[#6D213C] transition-colors"
        >
          <ShoppingBag size={17} strokeWidth={1.8} />
          <span>Shop</span>
        </Link>

        <button
          type="button"
          onClick={openCart}
          className="relative flex items-center gap-1.5 px-6 py-3 text-sm font-medium text-[#7A7570] hover:text-[#6D213C] transition-colors"
          aria-label="Open cart"
        >
          <span className="relative">
            <ShoppingCart size={17} strokeWidth={1.8} />

            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#6D213C] text-white text-[9px] font-bold flex items-center justify-center">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </span>

          <span>Cart</span>
        </button>

      </div>
    </nav>

    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[90px_minmax(0,500px)_1fr] gap-4 lg:gap-7">
      <div className="hidden lg:flex flex-col gap-3">{images.map((img, index) => <button key={index} onClick={() => setCurrentIndex(index)} className={`overflow-hidden rounded-xl border ${currentIndex === index ? "border-[#7a1f2b]" : "border-[#e7ddd2]"}`}><img src={img} alt="" className="w-full h-20 object-cover" /></button>)}</div>

      <div>
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-white border border-[#ece3d8]">
          <img src={activeImage} alt={product.title} className="w-full h-55 sm:h-70 md:h-85 object-contain p-1 sm:p-2" />
          {images.length > 1 && <><button onClick={() => setCurrentIndex((i) => i === 0 ? images.length - 1 : i - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 w-8 h-8 rounded-full flex items-center justify-center shadow" aria-label="Previous image"><ChevronLeft size={16} /></button><button onClick={() => setCurrentIndex((i) => i === images.length - 1 ? 0 : i + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 w-8 h-8 rounded-full flex items-center justify-center shadow" aria-label="Next image"><ChevronRight size={16} /></button></>}
        </div>
        {images.length > 1 && <div className="flex lg:hidden gap-2 mt-2 overflow-x-auto">{images.map((img, index) => <button key={index} onClick={() => setCurrentIndex(index)} className={`min-w-14 h-14 rounded-lg overflow-hidden border ${currentIndex === index ? "border-[#7a1f2b]" : "border-[#e7ddd2]"}`}><img src={img} alt="" className="w-full h-full object-cover" /></button>)}</div>}
      </div>

      <div className="lg:sticky lg:top-20 h-fit">
        <div className="bg-white border border-[#ece3d8] rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm">
          <h1 style={{fontFamily:"'Cormorant Garamond', serif"}} className="text-2xl sm:text-3xl md:text-4xl leading-tight font-bold text-[#1f1f1f]">{product.title}</h1>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#7a1f2b] mt-2">₦{product.price.toLocaleString()}</p>
          <p className="text-green-600 mt-1.5 text-xs sm:text-sm font-medium">Available</p>

          {product.colors?.length > 0 && <div className="mt-4"><p className="font-medium text-sm mb-1.5">Color</p><div className="flex flex-wrap gap-1.5">{product.colors.map((color) => <button key={color} onClick={() => setSelectedColor(color)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs ${selectedColor === color ? "bg-[#7a1f2b] text-white border-[#7a1f2b]" : "bg-white text-gray-700 border-[#ddd]"}`}><span className="w-3 h-3 rounded-full border border-gray-300" style={{backgroundColor:COLOR_MAP[color] || "#ccc"}} />{color}</button>)}</div></div>}

          <div className="mt-4"><p className="font-medium text-sm mb-1.5">Quantity</p><div className="flex items-center gap-1.5"><button onClick={() => setQuantity((q) => Math.max(1,q-1))} className="w-8 h-8 rounded-lg border flex items-center justify-center" aria-label="Decrease quantity"><Minus size={14}/></button><div className="w-10 h-8 rounded-lg border flex items-center justify-center text-sm font-semibold">{quantity}</div><button onClick={() => setQuantity((q) => q+1)} className="w-8 h-8 rounded-lg border flex items-center justify-center" aria-label="Increase quantity"><Plus size={14}/></button></div></div>

          <div className="mt-4 grid grid-cols-2 lg:grid-cols-1 gap-2"><button onClick={add} className="w-full border-2 border-[#7a1f2b] text-[#7a1f2b] py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5"><ShoppingBag size={16}/>{added ? "Added to Cart ✓" : "Add to Cart"}</button><button onClick={buyNow} className="w-full bg-[#7a1f2b] hover:bg-[#922d3d] text-white py-2.5 rounded-xl text-sm font-semibold">Buy Now</button></div>

          {product.description && <div className="mt-4 pt-4 border-t"><h3 className="font-semibold text-sm mb-1.5">Description</h3><p className="text-gray-600 leading-6 text-[13px]">{product.description}</p></div>}
          <p className="text-[11px] text-gray-500 leading-5 mt-4 pt-3 border-t">Secure online payment with Paystack. Bolt delivery is arranged separately and paid on delivery.</p>
        </div>
      </div>
    </div>

    {relatedProducts.length > 0 && (
      <section ref={relatedRef} className="max-w-6xl mx-auto mt-12 sm:mt-16 scroll-mt-6">
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#6D213C] mb-1">Keep Shopping</p>
            <h2 style={{fontFamily:"'Cormorant Garamond', serif"}} className="text-2xl sm:text-3xl font-bold text-[#1f1f1f]">You may also like</h2>
          </div>
          <Link to="/shop" className="text-xs font-semibold text-[#6D213C]">View all</Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {relatedProducts.map((item) => (
            <Link
              key={item.slug}
              to={`/product/${item.slug}`}
              className="bg-white rounded-xl overflow-hidden border border-[#ece3d8] shadow-sm hover:-translate-y-1 transition-transform"
            >
              <div className="aspect-square bg-[#F3EEE7] overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-contain p-1"
                />
              </div>

             <div className="p-3">
  <p className="text-xs sm:text-sm font-semibold text-[#2C2C2A] line-clamp-2">
    {item.title}
  </p>

  <p className="text-sm font-bold text-[#6D213C] mt-1">
    ₦{Number(item.price).toLocaleString()}
  </p>

  <span className="mt-2.5 inline-flex items-center justify-center w-full bg-[#6D213C] hover:bg-[#7a1f2b] text-white text-xs sm:text-sm font-semibold py-2 rounded-lg transition-colors">
    View Product
  </span>
</div>
            </Link>
          ))}
        </div>
      </section>
    )}
  </div>;
}