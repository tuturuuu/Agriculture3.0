import NavigationBar from "./components/NavigationBar";
import Carousel from "./components/Carousel";
import ProductCard from "./components/ProductCard";
import CategoryCard from "./components/CategoryCard";
import Footer from "./components/Footer";

const mockData = [
  {
    imageSrc: "/src/assets/png/robusta-coffee.png",
    title: "Robusta Coffee",
    description:
      "Robusta coffee is known for its strong, bold flavor and high caffeine content.",
    price: 0.12,
    isFavourite: true,
  },
  {
    imageSrc: "/src/assets/png/watermelon.png",
    title: "Watermelon",
    description: "Fresh and juicy watermelon, perfect for a refreshing snack.",
    price: 0.05,
    isFavourite: false,
  },
  {
    imageSrc: "/src/assets/png/banana.png",
    title: "Banana",
    description:
      "Sweet and ripe bananas, high in potassium and great for snacking.",
    price: 0.03,
    isFavourite: true,
  },
  {
    imageSrc: "/src/assets/png/rice.png",
    title: "Rice",
    description: "Premium quality rice, ideal for a variety of dishes.",
    price: 0.07,
    isFavourite: false,
  },
  {
    imageSrc: "/src/assets/png/durian.png",
    title: "Durian",
    description:
      "Known as the king of fruits, durian is famous for its unique taste and smell.",
    price: 0.15,
    isFavourite: true,
  },
  {
    imageSrc: "/src/assets/png/G7.png",
    title: "G7 Coffee",
    description:
      "Instant G7 coffee, convenient and flavorful for a quick caffeine fix.",
    price: 0.08,
    isFavourite: false,
  },
  {
    imageSrc: "/src/assets/png/Cong Coffee.png",
    title: "Cong Coffee",
    description: "Enjoy the rich and aromatic blend of Cong coffee.",
    price: 0.1,
    isFavourite: true,
  },
  {
    imageSrc: "/src/assets/png/rice ST25.png",
    title: "ST25 Rice",
    description: "Award-winning ST25 rice, known for its fragrance and taste.",
    price: 0.09,
    isFavourite: false,
  },
];

const mockCategory = [
  {
    imageSrc: "/src/assets/png/robusta-coffee.png",
    title: "Coffee",
  },
  {
    imageSrc: "/src/assets/png/grains.png",
    title: "Grains",
  },
  {
    imageSrc: "/src/assets/png/fruits.png",
    title: "Fruits",
  },
  {
    imageSrc: "/src/assets/png/seafood.png",
    title: "Seafood",
  },
  {
    imageSrc: "/src/assets/png/meat.png",
    title: "Meat",
  },
  {
    imageSrc: "/src/assets/png/peanut.png",
    title: "Beans",
  },
  {
    imageSrc: "/src/assets/png/corn.png",
    title: "Corn",
  },
  {
    imageSrc: "/src/assets/png/vegetables.png",
    title: "Vegetables",
  },
];

function App() {
  return (
    <>
      <NavigationBar />

      {/* Hero Section */}
      <div className="position-relative">
        <img
          src="src\assets\png\background.png"
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
          mockData={mockData}
          CardComponent={ProductCard}
          carouselId="productCarousel"
        />
      </section>

      {/* Browse categories */}
      <section className="p-5 mt-5" style={{ height: "50vh" }}>
        <h1 className="fs-2 fw-bold mb-5" style={{ marginLeft: "12%" }}>
          Browse categories 📖
        </h1>
        <Carousel
          mockData={mockCategory}
          CardComponent={CategoryCard}
          carouselId="categoryCarousel"
        />
      </section>

      <Footer />
    </>
  );
}

export default App;
