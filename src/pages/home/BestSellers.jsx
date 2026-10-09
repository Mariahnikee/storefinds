import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../../client";

export default function BestSellers() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    client
      .fetch(
        `*[_type == "shopMkProduct" && featured == true][0...6]{
          title,
          price,
          slug,
          "imageUrl": images[0].asset->url
        }`
      )
      .then(setProducts)
      .catch(console.error);
  }, []);

  return (
    <section className="px-6 py-16">
      <h2 className="text-3xl font-bold text-center mb-10">
        Best Sellers
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.slug.current} className="bg-white shadow rounded">
            <img src={p.imageUrl} className="h-60 w-full object-cover" />

            <div className="p-4">
              <h3 className="font-bold">{p.title}</h3>
              <p>₦{p.price}</p>

              <Link
                to={`/product/${p.slug.current}`}
                className="block mt-3 text-center bg-black text-white py-2 rounded"
              >
                View Product
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}