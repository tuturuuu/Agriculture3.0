import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ToastNotification from "./ToastNotification";
import { ethers } from "ethers";

const CartPanel = ({ isOpen, onClose, cartItems }) => {
  const [showNotification, setShowNotification] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("crypto");
  const [showSuccess, setShowSuccess] = useState(false);

  const totalPrice = cartItems
    .reduce((total, item) => total + parseFloat(item.price), 0)
    .toFixed(4);
  const totalUSD = (totalPrice * 1500).toFixed(2);

  const handlePurchase = () => {
    setShowSuccess(true);
    setShowNotification(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  return (
    <>
      {isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={onClose}
        />
      )}

      <div
        className="position-fixed top-4 end-0 h-auto bg-white shadow-lg d-flex flex-column"
        style={{
          width: "384px",
          zIndex: 1050,
          transform: `translateX(${isOpen ? "0" : "110%"})`,
          transition: "transform 0.3s ease-in-out",
          borderRadius: "10px 10px 10px 10px",
          top: "20px",
          bottom: "20px",
          right: "20px",
        }}
      >
        {/* Success Overlay */}
        {showSuccess && (
          <div
            className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(4px)",
              zIndex: 1060,
              borderRadius: "inherit",
              cursor: "pointer",
            }}
            onClick={handleCloseSuccess}
          >
            <div className="text-center">
              <CheckCircleIcon
                style={{
                  fontSize: "64px",
                  color: "#4CAF50",
                }}
              />
              <p
                className="mt-3 mb-0 fw-semibold"
                style={{ fontSize: "1.1rem" }}
              >
                Purchase successful!
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex-shrink-0 d-flex align-items-center justify-content-between p-3 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <h2 className="fs-5 fw-semibold mb-0">Your cart</h2>
            <InfoOutlinedIcon
              className="text-secondary"
              style={{ fontSize: "1rem" }}
            />
          </div>
          <button onClick={onClose} className="btn btn-link text-dark p-0">
            <CloseIcon style={{ fontSize: "1.25rem" }} />
          </button>
        </div>

        {/* Items Count and Clear */}
        <div className="flex-shrink-0 px-3 py-2">
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-secondary" style={{ fontSize: "0.9rem" }}>
              {cartItems.length} items
            </span>
            <button className="btn btn-link text-secondary p-0">
              Clear all
            </button>
          </div>
        </div>

        {/* Scrollable Items */}
        <div
          className="flex-grow-1 px-3 overflow-auto"
          style={{ maxHeight: "60vh" }}
        >
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="d-flex gap-3 align-items-center p-3 rounded-3"
              style={{ transition: "background 0.3s ease-in-out" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f8f9fa")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <img src={"http://127.0.0.1:8000/images/coffee-pictures/" + item.image} alt={item.name} className="rounded" style={{ width: '48px', height: '48px', objectFit: 'cover' }} />
              <div className="flex-grow-1">
                <h3 className="fw-medium mb-0" style={{ fontSize: "0.95rem" }}>
                  <a
                    href={`/product-details/${item.productId}`}
                    className="text-decoration-none text-dark"
                  >
                    {item.name}
                  </a>
                </h3>
                <p
                  className="text-secondary mb-0"
                  style={{ fontSize: "0.85rem" }}
                >
                  {item.creator ? `${item.creator.slice(0, 6)}...${item.creator.slice(-4)}` : "Unknown"}
                </p>
              </div>
              <p className="fw-medium mb-0" style={{ fontSize: "0.95rem" }}>
                {ethers.formatUnits(item?.price.toString(), "ether")}{" "} ETH
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div
          className="flex-shrink-0 bg-white border-top p-3 position-sticky bottom-0"
          style={{ borderRadius: "0 0 28px 28px" }}
        >
          <h3 className="fs-6 fw-medium mb-2">Payment Method</h3>
          <div className="d-flex flex-column gap-2 mb-3">
            <label className="d-flex align-items-center p-3 border rounded-3 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="crypto"
                checked={paymentMethod === "crypto"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="me-2"
              />
              <AccountBalanceWalletIcon
                className="me-2 text-secondary"
                style={{ fontSize: "1.1rem" }}
              />
              <span style={{ fontSize: "0.9rem" }}>Crypto</span>
            </label>
            <label className="d-flex align-items-center p-3 border rounded-3 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === "card"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="me-2"
              />
              <CreditCardIcon
                className="me-2 text-secondary"
                style={{ fontSize: "1.1rem" }}
              />
              <span style={{ fontSize: "0.9rem" }}>Card</span>
            </label>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-1">
            <span style={{ fontSize: "0.9rem" }}>Total price</span>
            <span className="fw-semibold" style={{ fontSize: "0.9rem" }}>
              {totalPrice} ETH
            </span>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-secondary" style={{ fontSize: "0.85rem" }}>
              USD Price
            </span>
            <span className="text-secondary" style={{ fontSize: "0.85rem" }}>
              ${totalUSD}
            </span>
          </div>

          <button
            className="btn btn-primary w-100 py-2 fw-semibold rounded-3"
            onClick={handlePurchase}
          >
            Complete purchase
          </button>
        </div>
      </div>

      {showNotification && (
        <ToastNotification
          message={`Successfully purchased ${cartItems.length} items for ${totalPrice} ETH`}
          onClose={() => setShowNotification(false)}
          duration={5000}
        />
      )}
    </>
  );
};

export default CartPanel;
