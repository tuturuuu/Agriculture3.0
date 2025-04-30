import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Button } from "@mui/material";
import ToastNotification from "./ToastNotification";

const WalletPanel = ({ isOpen, onClose }) => {
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  if (!isOpen) return null;

  const walletOptions = [
    { name: "MetaMask", icon: "🦊", lastUsed: true },
    { name: "Coinbase Wallet", icon: "🔵" },
    { name: "WalletConnect", icon: "🌉" },
  ];

  return (
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
        <div className="text-center mb-3">
          <h5 className="fw-bold mb-1">Connect to Agriculture 3.0</h5>
        </div>

        {/* Wallet Options as Selectable Buttons */}
        <div>
          {walletOptions.map((wallet) => (
            <Button
              key={wallet.name}
              variant={
                selectedWallet === wallet.name ? "contained" : "outlined"
              }
              fullWidth
              startIcon={
                <span style={{ fontSize: "1.5rem" }}>{wallet.icon}</span>
              }
              sx={{
                textTransform: "none",
                justifyContent: "flex-start",
                mb: 1,
                padding: "10px 15px",
                fontSize: "1rem",
                fontWeight: "500",
                borderRadius: "8px",
                backgroundColor:
                  selectedWallet === wallet.name ? "#1976d2" : "transparent",
                color: selectedWallet === wallet.name ? "#fff" : "#000",
              }}
              onClick={() => setSelectedWallet(wallet.name)}
              onDoubleClick={() => setShowNotification(true)}
            >
              {wallet.name}{" "}
              {wallet.lastUsed && (
                <span className="badge bg-light text-dark ms-2">Last Used</span>
              )}
            </Button>
          ))}
        </div>

        {/* Email Option */}
        <div className="text-center mt-3">
          <small className="text-muted">OR</small>
          <div className="mt-2 d-flex align-items-center border rounded-3 px-3 py-2 cursor-pointer">
            <input
              type="email"
              className="form-control border-0"
              placeholder="Continue with email"
            />
            <button className="btn text-primary fs-5">➡️</button>
          </div>
          <p className="text-muted mt-2" style={{ fontSize: "0.8rem" }}>
            If you haven’t logged in using your email before, you will create a
            new wallet using this email.
          </p>
        </div>
      </div>
      {showNotification && (
        <ToastNotification
          message={`Successfully purchased  items`}
          onClose={() => setShowNotification(false)}
          duration={5000}
        />
      )}
    </div>
  );
};

export default WalletPanel;
