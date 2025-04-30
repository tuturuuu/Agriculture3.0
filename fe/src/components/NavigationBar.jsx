import CartPanel from "./CartPanel";
import { useState } from "react";
import { ethers } from "ethers";
import { useEffect } from "react";
import api from "../utils/api"
import LogoIcon from "/src/assets/svg/logo.svg";
import CartIcon from "/src/assets/svg/shopping_cart.svg";
import UserIcon from "/src/assets/svg/user.svg";

const API_URL = import.meta.env.VITE_API_URL;

export default function NavigationBar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const toggleCart = () => setIsCartOpen(!isCartOpen);
 
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await api.get("/cart");
        setCartItems(response.data);
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    fetchCart();
    
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    if (token) {
      checkWalletConnection();
    }
  }, []);

  const checkWalletConnection = async () => {
    if (!window.ethereum) return;
    
    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts"  // This doesn't prompt, just checks current connection
      });
      
      if (accounts.length > 0) {
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        const newSigner = await newProvider.getSigner();
        
        setAccount(accounts[0]);
        setProvider(newProvider);
        setSigner(newSigner);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };

  const toggleWallet = async () => {
    if (isLoggedIn) {
      // Logout functionality
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      setAccount(null);
      setSigner(null);
      setProvider(null);
    } else {
      // Login functionality
      try {
        await connectWallet();
      } catch (error) {
        console.error("Wallet connection failed:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      console.error("MetaMask is not installed.");
      return;
    }

    try {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const newSigner = await newProvider.getSigner();

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length > 0) {
        console.log("Wallet connected:", accounts[0]);
        setAccount(accounts[0]);
      }

      setProvider(newProvider);
      setSigner(newSigner);

      await authenticateUser(accounts[0], newSigner);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const authenticateUser = async (walletAddress, signer) => {
    try {
      // Request nonce from backend
      const nonceResponse = await api.get(
        `/users/auth/nonce/${walletAddress}`,
      );
      const { nonce } = nonceResponse.data;

      // Sign nonce with MetaMask
      const message = `Sign this message to authenticate: ${nonce}`;
      const signature = await signer.signMessage(message);

      // Send signature to backend for verification
      const verifyResponse = await api.post(
        `/users/auth/verify`,
        {
          wallet_address: walletAddress,
          signature: signature,
        },
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      const { token } = verifyResponse.data;
      localStorage.setItem("token", token);
      setIsLoggedIn(true);
      
      console.log("Authentication successful, token:", token);
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  };

  // Handle MetaMask account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        console.log("Wallet disconnected");
        setAccount(null);
        setSigner(null);
        setIsLoggedIn(false);
        localStorage.removeItem("token");
      } else {
        console.log("Wallet switched:", accounts[0]);
        setAccount(accounts[0]);
        
        // Update provider and signer
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        const newSigner = await newProvider.getSigner();
        setProvider(newProvider);
        setSigner(newSigner);
        
        // Set as not logged in when account changes
        setIsLoggedIn(false);
        localStorage.removeItem("token");
        
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () =>
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
  }, []);

  // Function to format address for display
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom px-3 px-lg-5">
        <div className="container-fluid">
          {/* Logo and Brand - Always visible */}
          <div className="d-flex align-items-center">
            <a
              href="/"
              className="navbar-brand d-flex align-items-center gap-3 me-4 "
            >
              <img src={LogoIcon} alt="" width={50} height={50} />
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
              <a href="/" className="nav-link fw-semibold">
                Home
              </a>
              <a href="/stats" className="nav-link fw-semibold">
                Stats
              </a>
              <a href="/create" className="nav-link fw-semibold">
                Create
              </a>
              <a href="/about" className="nav-link fw-semibold">
                About
              </a>
            </div>

            {/* Right side items */}
            <div className="d-flex align-items-center gap-3">
              <a href="#" className="nav-link" onClick={toggleCart}>
                <img src={CartIcon} alt="Cart" width={25} height={25} />
              </a>
              <a href="/user-profile" className="nav-link">
                <img src={UserIcon} alt="User" width={25} height={25} />
              </a>
              
              <button
                type="button"
                className={`btn px-4 fw-bolder ${isLoggedIn ? "btn-success" : "btn-dark"}`}
                onClick={toggleWallet}
              >
                {isLoggedIn ? (
                  <div className="d-flex align-items-center gap-2">
                    <span className="d-none d-md-inline">Connected:</span>
                    <span>{formatAddress(account)}</span>
                  </div>
                ) : (
                  "Login"
                )}
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