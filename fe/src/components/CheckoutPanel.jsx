import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CurrencyBitcoinIcon from "@mui/icons-material/CurrencyBitcoin";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WalletPanel from "./WalletPanel";
import abi from "../../../dapp/artifacts/contracts/AgriTrade.sol/AgriTrade.json";
import { ethers } from "ethers";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import api from "../utils/api";

const CheckoutPanel = ({ isOpen, onClose, product, quantity }) => {
  console.log(product)
  const [selectedPayment, setSelectedPayment] = useState("Crypto");
  const [showWalletPanel, setShowWalletPanel] = useState(false);
  const [destination, setDestination] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info" // can be 'error', 'warning', 'info', or 'success'
  });
  
  if (!isOpen) return null;

  const paymentMethods = [
    { name: "Crypto", icon: <CurrencyBitcoinIcon /> },
    { name: "Card", icon: <CreditCardIcon /> },
  ];
  const total = BigInt(quantity) * product.price;
  
  const showNotification = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const handleDestinationChange = (e) => {
    setDestination(e.target.value);
  };

  const handleCompletePurchase = async () => {

    const token = localStorage.getItem("token");
    if(!token) {
      showNotification("Please login first", "error");
      return
    }

    // Validate destination field
    if (!destination.trim()) {
      showNotification("Please enter a destination address", "error");
      return;
    }

    if (selectedPayment === "Crypto") {
      // Show pending notification
      showNotification("Processing your transaction...", "info");
      
      // Connect to MetaMask
      if (!window.ethereum) {
        showNotification("MetaMask not found. Please install it.", "error");
        return;
      }

      const token = localStorage.getItem("token");
      if(!token) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Contract instance
        const contract = new ethers.Contract(
          import.meta.env.VITE_CONTRACT_ADDRESS, // Replace with actual contract address
          abi.abi,
          signer,
        );
        
        console.log(total.toString());
        // Execute blockchain transaction
        const tx = await contract.buyBatch(product.productId, quantity, {
          value: total.toString(), // Send the correct amount in wei
        });

        showNotification("Transaction submitted, waiting for confirmation...", "info");
        await tx.wait(); // Wait for transaction confirmation

        try {
          // Update backend with destination field
          const response = await api.post(
            `/products/buy/${product.productId}`,
            {
              quantity: quantity,
              destination: destination,
              owner_address: product.ownerAddress
            },
          );

          showNotification("Purchase successful!", "success");
          console.log("Purchase Successful:", response.data);
          
          // Close the checkout panel after a short delay
          setTimeout(() => {
            onClose();
          }, 2000);
          
        } catch (error) {
          console.error(
            "Purchase Failed:",
            error.response?.data || error.message,
          );
          showNotification(
            "Error: " + (error.response?.data.detail || "Failed to update inventory"), 
            "error"
          );
        }
      } catch (error) {
        console.error("Transaction failed:", error);
        showNotification(
          "Transaction failed: " + (error.reason || error.message || "Unknown error"), 
          "error"
        );
      }
    } else {
      // Handle card payment
      showNotification("Card payment is not implemented yet", "warning");
    }
  };

  return (
    <>
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50"
        style={{ zIndex: 1050 }}
      >
        <div
          className="bg-white shadow-lg rounded-4 p-4 position-relative d-flex flex-column"
          style={{ width: "400px" }}
        >
          {/* Close Button */}
          <button
            className="position-absolute top-0 end-0 m-3 btn btn-link text-dark p-0"
            onClick={onClose}
          >
            <CloseIcon style={{ fontSize: "1.5rem" }} />
          </button>

          {/* Header */}
          <h5 className="fw-bold mb-4">Complete checkout</h5>

          {/* Item Details */}
          <div className="d-flex align-items-center mb-4 p-2 bg-light rounded-3">
            <img
              src={
                "http://127.0.0.1:8000/images/coffee-pictures/" +
                product.imageSrc
              }
              alt={product.name}
              className="rounded-3 me-3"
              style={{ width: "48px", height: "48px", objectFit: "cover" }}
            />
            <div className="flex-grow-1">
              <div className="fw-medium">{product.name}</div>
            </div>
            <div className="text-end">
              <div className="fw-bold">+{quantity} units</div>
              <div className="text-muted">{total.toString()} wei</div>
            </div>
          </div>

          {/* Destination Address Field */}
          <div className="mb-4">
            <h6 className="mb-3">Shipping Destination</h6>
            <input
              type="text"
              className="form-control py-3 rounded-3"
              placeholder="Enter destination address"
              value={destination}
              onChange={handleDestinationChange}
              required
            />
            <small className="text-muted mt-1 d-block">
              Enter the address where you want your product to be delivered
            </small>
          </div>

          {/* Payment Method */}
          <div className="mb-4">
            <h6 className="mb-3">Payment Method</h6>
            <div className="d-flex gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.name}
                  className={`btn flex-grow-1 p-3 d-flex align-items-center justify-content-center gap-2 ${
                    selectedPayment === method.name
                      ? "btn-primary text-white"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() => setSelectedPayment(method.name)}
                  style={{
                    transition: "all 0.2s ease-in-out",
                    borderRadius: "12px",
                  }}
                >
                  <span>{method.icon}</span>
                  <span className="fw-medium">{method.name}</span>
                  {method.name === "Card" && (
                    <InfoOutlinedIcon fontSize="small" className="ms-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Total and Action */}
          <div className="mt-auto">
            <div className="d-flex justify-content-between mb-3">
              <span className="fw-bold">Total</span>
              <span className="fw-bold">{total.toString()} wei</span>
            </div>
            <button
              className="btn btn-primary w-100 py-3 rounded-3"
              onClick={handleCompletePurchase}
            >
              Complete Purchase
            </button>
          </div>
        </div>
      </div>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* <WalletPanel 
        isOpen={showWalletPanel} 
        onClose={() => setShowWalletPanel(false)} 
      /> */}
    </>
  );
};

export default CheckoutPanel;