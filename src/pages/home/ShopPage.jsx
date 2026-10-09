import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import client from "../../client";

const palette = {
  burgundy: "#6D213C",
  burgundyLight: "#8B2D4F",
  charcoal: "#1f1f1f",
  taupe: "#D6C7BE",
  beige: "#F3EEE7",
  offWhite: "#FAF7F2",
};

function ProductCard({ product, i }) {
  return (
    <motion.div
      key={product.slug.current}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.03 }}
    >
      <Link
        to={`/product/${product.slug.current}`}
        style={{
          background: "#fff",
          borderRadius: 16,
          overflow: "hidden",
          border: `1px solid ${palette.taupe}44`,
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          textDecoration: "none",
          transition: "0.3s ease",
          position: "relative",
        }}
        className="shop-card"
      >
        <div
          style={{
            aspectRatio: "1 / 1",
            overflow: "hidden",
            background: palette.beige,
            position: "relative",
          }}
        >
          <img
            src={product.imageUrl}
            alt={product.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.45s ease",
              display: "block",
            }}
            className="shop-image"
          />
          {product.featured && <div></div>}
        </div>

        <div
          style={{
            padding: "0.75rem 0.85rem 0.85rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.3rem",
          }}
        >
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#2f2f2f",
              lineHeight: 1.35,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              margin: 0,
            }}
          >
            {product.title}
          </h2>

          <p
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: palette.burgundy,
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            ₦{product.price.toLocaleString()}
          </p>

          <div
            style={{
              marginTop: "0.4rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: palette.burgundy,
              color: "#fff",
              padding: "0.6rem",
              borderRadius: 10,
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.02em",
              transition: "0.25s ease",
            }}
            className="view-btn"
          >
            View Product
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const tabsRef = useRef(null);
  const [showArrow, setShowArrow] = useState(true);

  const productsPerPage = 8;

  const scrollTabs = () => {
    tabsRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  const handleTabsScroll = () => {
    const el = tabsRef.current;
    if (!el) return;
    setShowArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  const categories = [
    "All",
    "Home Decor",
    "Bedroom",
    "Lighting",
    "Accessories",
    "Kitchen",
    "Bathroom",
    "Storage",
    "Lifestyle",
  ];

  const shopRef = useRef(null);
  const productsRef = useRef(null);

  useEffect(() => {
    client
      .fetch(
        `*[_type == "shopMkProduct" && defined(slug.current)] | order(_createdAt desc){
          title,
          slug,
          price,
          category,
          featured,
          "imageUrl": images[0].asset->url
        }`,
      )
      .then(setProducts)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const target = currentPage === 1 ? shopRef.current : productsRef.current;

    target?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [currentPage]);

  const featuredProducts = products.filter((p) => p.featured);
  const featuredSlugs = new Set(featuredProducts.map((p) => p.slug.current));

  const filteredProducts =
    activeCategory === "All"
      ? products.filter((p) => !featuredSlugs.has(p.slug.current))
      : products.filter(
          (p) =>
            p.category === activeCategory && !featuredSlugs.has(p.slug.current),
        );

  // When filtering by category, include featured products of that category too
  const filteredFeatured =
    activeCategory === "All"
      ? featuredProducts
      : featuredProducts.filter((p) => p.category === activeCategory);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const visibleProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage,
  );

  return (
    <div
      style={{
        background: palette.offWhite,
        minHeight: "100vh",
        padding: "1.5rem 0 5rem",
      }}
    >
      <section
        ref={shopRef}
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          padding: "0 1.25rem",
        }}
      >
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "0rem" }}>
          {/* <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: palette.burgundy,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Shop MK Finds
          </span> */}
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.9rem, 4vw, 3rem)",
              fontWeight: 800,
              color: palette.charcoal,
              marginTop: "0",
              letterSpacing: "-0.03em",
            }}
          >
            Shop All Products
          </h1>
        </div>

        {/* CATEGORY TABS */}
        <div style={{ position: "relative", marginBottom: "1rem" }}>
          <div
            ref={tabsRef}
            onScroll={handleTabsScroll}
            style={{
              display: "flex",
              gap: 10,
              overflowX: "auto",
              paddingBottom: "0",
              paddingRight: "2.5rem",
              scrollbarWidth: "none",
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setCurrentPage(1);
                }}
                style={{
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  borderRadius: 999,
                  padding: "0.72rem 1rem",
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  transition: "0.25s ease",
                  background:
                    activeCategory === cat ? palette.burgundy : "#fff",
                  color: activeCategory === cat ? "#fff" : palette.charcoal,
                  border:
                    activeCategory === cat
                      ? "none"
                      : `1px solid ${palette.taupe}55`,
                  boxShadow:
                    activeCategory === cat
                      ? "0 8px 20px rgba(109,33,60,0.15)"
                      : "none",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {showArrow && (
            <button
              onClick={scrollTabs}
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                height: "calc(100% - 0.8rem)",
                width: 44,
                background: `linear-gradient(to right, transparent, ${palette.offWhite} 40%)`,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingRight: 4,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "#fff",
                  border: `1px solid ${palette.taupe}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={palette.burgundy}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>
          )}
        </div>

        {/* FEATURED SECTION */}
        {currentPage === 1 && filteredFeatured.length > 0 && (
          <section style={{ marginBottom: "1rem" }}>
            <div style={{ marginBottom: "1.25rem" }}>
              {/* <p
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  color: palette.burgundy,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Shop MK Finds
              </p> */}
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(1.4rem, 3vw, 2rem)",
                  fontWeight: 700,
                  color: palette.charcoal,
                  margin: 0,
                }}
              >
                Best Sellers
              </h2>
            </div>

            <div className="shop-grid">
              {filteredFeatured.map((product, i) => (
                <ProductCard
                  key={product.slug.current}
                  product={product}
                  i={i}
                />
              ))}
            </div>

            {/* divider */}
            {visibleProducts.length > 0 && (
              <div
                style={{
                  marginTop: "3rem",
                  borderTop: `1px solid ${palette.taupe}55`,
                }}
              />
            )}
          </section>
        )}

        {/* ALL OTHER PRODUCTS */}
        {visibleProducts.length > 0 && (
          <section ref={productsRef}>
            {filteredFeatured.length > 0 && (
              <div style={{ marginBottom: "1.25rem" }}>
                <p
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    color: palette.burgundy,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  Browse All
                </p>
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(1.4rem, 3vw, 2rem)",
                    fontWeight: 700,
                    color: palette.charcoal,
                    margin: 0,
                  }}
                >
                  More Products
                </h2>
              </div>
            )}

            <div className="shop-grid">
              {visibleProducts.map((product, i) => (
                <ProductCard
                  key={product.slug.current}
                  product={product}
                  i={i}
                />
              ))}
            </div>
          </section>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.45rem",
              marginTop: "3rem",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                border: "none",
                background: "#fff",
                cursor: "pointer",
                fontWeight: 700,
                opacity: currentPage === 1 ? 0.4 : 1,
              }}
            >
              ←
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(
                Math.max(currentPage - 3, 0),
                Math.min(currentPage + 2, totalPages),
              )
              .map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    border: "none",
                    cursor: "pointer",
                    background:
                      currentPage === page ? palette.burgundy : "#fff",
                    color: currentPage === page ? "#fff" : palette.charcoal,
                    fontWeight: 700,
                    transition: "0.2s ease",
                    boxShadow:
                      currentPage === page
                        ? "0 8px 20px rgba(109,33,60,0.18)"
                        : "none",
                  }}
                >
                  {page}
                </button>
              ))}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                border: "none",
                background: "#fff",
                cursor: "pointer",
                fontWeight: 700,
                opacity: currentPage === totalPages ? 0.4 : 1,
              }}
            >
              →
            </button>
          </div>
        )}
      </section>

      <style>{`
        .shop-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          align-items: start;
        }

        .shop-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 40px rgba(0,0,0,0.08);
        }

        .shop-card:hover .shop-image {
          transform: scale(1.06);
        }

        .shop-card:hover .view-btn {
          background: ${palette.burgundyLight};
        }

        @media (min-width: 640px) {
          .shop-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .shop-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 18px;
          }
        }
      `}</style>
    </div>
  );
}
