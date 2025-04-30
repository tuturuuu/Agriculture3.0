import React, { useState, useEffect } from "react";
import Carousel from "./components/Carousel";
import ProductCard from "./components/ProductCard";
import CategoryCard from "./components/CategoryCard";
import api from "./utils/api"

function App() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([])
  // Using async function inside useEffect
  useEffect(() => {
    const fetchCategoriesAndPictures = async () => {
      try {
        const [categoriesResponse, picturesResponse, productResponse] = await Promise.all([
          api.get("/categories/"),
          api.get("/images/categories-pictures/"),
          api.get("/products/limit/8")
        ]);

        const categoriesData = categoriesResponse.data;
        const picturesData = picturesResponse.data.images;
        const productData = productResponse.data
        if (categoriesData && picturesData && productResponse) {
          const formattedCategories = categoriesData.map((category, index) => ({
            title: category,
            imageSrc: picturesData[index] || '', // Use the corresponding image or empty string
          }));

          setCategories(formattedCategories);
          setProducts(productData)
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchCategoriesAndPictures();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <div className="position-relative">
        <img
          src="src/assets/png/background.png"
          alt=""
          width="100%"
          height="575px"
          style={{ objectFit: "cover" }}
        />
        <span
          style={{
            top: "50%",
            left: "50%",
            position: "absolute",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            fontSize: "3rem",
          }}
          className="fw-semibold"
        >
          Algriculture Blockchain Trading Platform <br />
          <button
            style={{ width: "55%", marginTop: "3%", borderRadius: "30px" }}
            className="btn btn-lg btn-dark fs-4 fw-semibold"
            type="button"
          >
            Get started
          </button>
        </span>
      </div>

      {/* Popular Section */}
      <section className="p-5 mt-5">
        <h1 className="fs-2 fw-bold mb-5" style={{ marginLeft: "12%" }}>
          Popular products🔥
        </h1>
        <Carousel
          mockData={products}
          CardComponent={ProductCard}
          carouselId="productCarousel"
        />
      </section>

      {/* Browse Categories Section (Dynamic from FastAPI) */}
      <section className="p-5 mt-5" style={{ height: "50vh" }}>
        <h1 className="fs-2 fw-bold mb-5" style={{ marginLeft: "12%" }}>
          Browse categories 📖
        </h1>
        <Carousel
          mockData={categories} // Use categories with OG images
          CardComponent={CategoryCard}
          carouselId="categoryCarousel"
        />
      </section>
    </>
  );
}

export default App;
