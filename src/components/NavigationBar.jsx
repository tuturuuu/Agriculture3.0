import CartPanel from "./CartPanel";
import { useState } from "react";

export default function NavigationBar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems] = useState([
    {
      id: 1,
      name: "Cong Coffee",
      price: "0.05",
      earnings: "5%",
      image: "/src/assets/png/Cong Coffee.png",
      creator: "Agriculture 3.0"
    },
    {
      id: 2,
      name: "Chuối",
      price: "0.05",
      earnings: "5%",
      image: "/src/assets/png/banana.png",
      creator: "Agriculture 3.0"
    },
    {
      id: 3,
      name: "Ngô",
      price: "0.05",
      earnings: "5%",
      image: "/src/assets/png/corn.png",
      creator: "Agriculture 3.0"
    },
    {
      id: 1,
      name: "Cong Coffee",
      price: "0.05",
      earnings: "5%",
      image: "/src/assets/png/Cong Coffee.png",
      creator: "Agriculture 3.0"
    },
    {
      id: 2,
      name: "Chuối",
      price: "0.05",
      earnings: "5%",
      image: "/src/assets/png/banana.png",
      creator: "Agriculture 3.0"
    },
    {
      id: 3,
      name: "Ngô",
      price: "0.05",
      earnings: "5%",
      image: "/src/assets/png/corn.png",
      creator: "Agriculture 3.0"
    },
  ]);

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  return (
    <div>
    <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top border-bottom px-3 px-lg-5">
      <div className="container-fluid">
        {/* Logo and Brand - Always visible */}
        <div className="d-flex align-items-center">
          <a href="/" className="navbar-brand d-flex align-items-center gap-3 me-4 ">
            <img src="src/assets/svg/logo.svg" alt="" width={50} height={50}/>
            <span className="fw-bolder fs-4 pt-3">Agriculture 3.0</span>
          </a>
        </div>

        {/* Hamburger button for mobile */}
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarContent" 
          aria-controls="navbarContent" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible content */}
        <div className="collapse navbar-collapse" id="navbarContent">
          {/* Navigation Links */}
          <div className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 pt-3">
            <span className="nav-link d-none d-lg-block">|</span>
            <a href="/" className="nav-link fw-semibold">Home</a>
            <a href="/stats" className="nav-link fw-semibold">Stats</a>
            <a href="/create" className="nav-link fw-semibold">Create</a>
            <a href="/about" className="nav-link fw-semibold">About</a>
          </div>

          {/* Right side items */}
          <div className="d-flex align-items-center gap-3">
            <a href="#" className="nav-link" onClick={toggleCart}>
              <img src="src/assets/svg/shopping_cart.svg" alt="Cart" width={25} height={25}/>
            </a>
            <a href="/user-profile" className="nav-link">
              <img src="src/assets/svg/user.svg" alt="User" width={25} height={25}/>
            </a>
            <button type="button" className="btn btn-dark px-4 fw-bolder">
              Login
            </button>
          </div>
        </div>
      </div>
    </nav>

    <CartPanel 
    isOpen={isCartOpen}
    onClose={() => setIsCartOpen(false)}
    cartItems={cartItems}
    />
  </div>
  );
}