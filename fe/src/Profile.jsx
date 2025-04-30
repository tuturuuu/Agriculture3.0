import { useEffect, useState } from "react";

import {
  Avatar,
  Button,
  Typography,
  TextField,
  Box,
  Tab,
  Tabs,
  Pagination,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import abi from '../../dapp/artifacts/contracts/AgriTrade.sol/AgriTrade.json';
import {ethers} from 'ethers'; 

import TransactionTable from "./components/TransactionTable";
import BatchesTable from "./components/BatchesTable";
import { StartShipmentDialog, NewLegDialog, CompleteLegDialog } from "./components/ShipmentDialogs";
import api from "./utils/api";

export default function Profile() {
  const [avatar, setAvatar] = useState("src/assets/png/def_ava.png");
  const [activeTab, setActiveTab] = useState("Transactions");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [userTransactions, setUserTransactions] = useState([]);
  const [userBatches, setUserBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null); // "buyer" or "seller" or "both"
  const [userAddress, setUserAddress] = useState("");
  const [formattedAddress, setFormattedAddress] = useState("Unnamed");
  
  // Add state for shipment dialog
  const [isShipmentDialogOpen, setIsShipmentDialogOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [shipmentFrom, setShipmentFrom] = useState("");
  const [shipmentTo, setShipmentTo] = useState("");
  const [isNewLegDialogOpen, setIsNewLegDialogOpen] = useState(false);
  const [isCompleteLegDialogOpen, setIsCompleteLegDialogOpen] = useState(false);
  const [selectedLegIndex, setSelectedLegIndex] = useState(null);
  const [batchShipments, setBatchShipments] = useState({});
  const [shipmentDetails, setShipmentDetails] = useState("");

  // Add pagination state for transactions and batches
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1);
  const [currentBatchPage, setCurrentBatchPage] = useState(1);
  const itemsPerPage = 10;

  // Add pagination handlers
  const handleTransactionPageChange = (event, value) => {
    setCurrentTransactionPage(value);
  };
  
  const handleBatchPageChange = (event, value) => {
    setCurrentBatchPage(value);
  };

  useEffect(() => {
    const setup = async () => {
      try {
        setLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        
        const signer = await provider.getSigner();
        setSigner(signer);

        const address = await signer.getAddress();
        setUserAddress(address);
        
        const formatted = `${address.slice(0, 6)}...${address.slice(-4)}`;
        setFormattedAddress(formatted);

        // Contract instance
        const contract = new ethers.Contract(
          import.meta.env.VITE_CONTRACT_ADDRESS, // Replace with actual contract address
          abi.abi,
          signer
        );
        setContract(contract);
        
        // Load user data
        await loadUserData(contract, address);
        
        setLoading(false);
      } catch (err) {
        console.error("Error setting up application:", err);
        setError("Failed to connect to blockchain. Please check your wallet connection.");
        setLoading(false);
      }
    };

    setup();
  }, []);
  
  const loadUserData = async (contract, address) => {
    try {

      const response = await api.get(`/transactions/user/me`);
      const apiTransactions = response.data

      // Get user's transactions
      const txIds = await contract.getUserTransactions(address);
      const transactions = await contract.transactions(3)
      console.log(transactions)
      // Get transaction details
      const txPromises = txIds.map(async (id) => {
        try {
          const tx = await contract.transactions(id);
          console.log("This is tx", tx)
          const batch = await contract.batches(tx.batchId);
          // Fetch shipment data for each batch
          const shipmentData = await contract.getBatchJourney(tx.batchId);
          if (shipmentData && shipmentData.length > 0) {
            setBatchShipments(prev => ({
              ...prev,
              [tx.batchId.toString()]: shipmentData
            }));
          }
          // Find matching API transaction by id or other identifiers
          const matchingApiTx = apiTransactions.find(apiTx => 
            apiTx.transactionId.toString() === id.toString() || 
            apiTx.productId.toString() === tx.batchId.toString()
          );

          return {
            txId: id.toString(),
            batchId: tx.batchId.toString(),
            buyer: tx.buyer,
            seller: tx.seller,
            price: ethers.formatEther(tx.price),
            quantity: tx.quantity.toString(),
            status: ["Not Shipped", "In Transit", "Delivered", "Confirmed", "Disputed"][tx.status],
            timestamp: new Date().toLocaleString(), // Placeholder
            userRole: address.toLowerCase() === tx.buyer.toLowerCase() ? "buyer" : "seller",
            location: batch.location,
            // Add API data if available
            productName: matchingApiTx?.productName || "Unknown Product",
            destination: matchingApiTx?.destination || "",
            apiTimestamp: matchingApiTx?.timestamp ? new Date(matchingApiTx.timestamp).toLocaleString() : null
          };
        } catch (err) {
          console.error(`Error fetching transaction ${id}:`, err);
          return null;
        }
      });
      
      const txDetails = (await Promise.all(txPromises)).filter(tx => tx !== null);
      setUserTransactions(txDetails);
      
      // Get user's batches
      const batchIds = await contract.getUserBatches(address);
      
      // Get batch details
      const batchPromises = batchIds.map(async (id) => {
        try {
          const batch = await contract.batches(id);
          
          return {
            batchId: id.toString(),
            parentId: batch.parentId.toString(),
            creator: batch.creator,
            location: batch.location,
            quantity: batch.quantity.toString(),
            available: batch.available.toString(),
            isForSale: batch.isForSale,
            price: ethers.formatEther(batch.price),
            state: ["Available", "Purchased", "Shipped", "Delivered", "TransferPending", "Transferred"][batch.state],
            pendingOwner: batch.pendingOwner,
            isOwner: address.toLowerCase() === batch.creator.toLowerCase()
          };
        } catch (err) {
          console.error(`Error fetching batch ${id}:`, err);
          return null;
        }
      });
      
      const batchDetails = (await Promise.all(batchPromises)).filter(batch => batch !== null);
      setUserBatches(batchDetails);
      
      // Determine user role
      const isBuyer = txDetails.some(tx => tx.userRole === "buyer");
      const isSeller = txDetails.some(tx => tx.userRole === "seller");
      
      if (isBuyer && isSeller) setUserRole("both");
      else if (isBuyer) setUserRole("buyer");
      else if (isSeller) setUserRole("seller");
      else setUserRole("new user");
      
    } catch (err) {
      console.error("Error loading user data:", err);
      setError("Failed to load your transactions and batches. Please try again later.");
    }
  };
  
  // Function to confirm purchase
  const handleConfirmPurchase = async (txId) => {
    if (!contract) return;
    
    try {
      const tx = await contract.confirmPurchase(txId);
      await tx.wait();
      
      // Reload data after confirmation
      await loadUserData(contract, userAddress);
      
      alert("Purchase confirmed successfully!");
    } catch (err) {
      console.error("Error confirming purchase:", err);
      alert("Failed to confirm purchase. " + err.message);
    }
  };
  
  // Function to start shipment
  const handleStartShipment = async () => {
    if (!contract || !selectedBatchId) return;
    
    try {
      const tx = await contract.addShipment(selectedBatchId, shipmentFrom, shipmentTo, shipmentDetails);
      await tx.wait();
      
      // Close dialog and reload data
      setIsShipmentDialogOpen(false);
      setShipmentDetails(""); // Reset the details field
      await loadUserData(contract, userAddress);
      
      alert("Shipment started successfully!");
    } catch (err) {
      console.error("Error starting shipment:", err);
      alert("Failed to start shipment. " + err.message);
    }
  };

  const handleAddShipmentLeg = async () => {
    if (!contract || !selectedBatchId || !shipmentFrom || !shipmentTo) return;
    
    try {
      const tx = await contract.addShipment(selectedBatchId, shipmentFrom, shipmentTo, shipmentDetails);
      await tx.wait();
      
      // Close dialog and reload data
      setIsNewLegDialogOpen(false);
      setShipmentDetails("");
      await loadUserData(contract, userAddress);
      
      alert("New shipment leg added successfully!");
    } catch (err) {
      console.error("Error adding shipment leg:", err);
      alert("Failed to add shipment leg. " + err.message);
    }
  };
  
  const handleCompleteLeg = async () => {
    console.log({
      selectedTransactionId,
      selectedBatchId,
      selectedLegIndex,
    });
    if (!contract || !selectedBatchId || selectedLegIndex === null || !selectedTransactionId) return;
    
    try {
      const tx = await contract.completeLeg(selectedBatchId, selectedLegIndex, selectedTransactionId);
      await tx.wait();
      
      // Close dialog and reload data
      setIsCompleteLegDialogOpen(false);
      await loadUserData(contract, userAddress);
      
      alert("Shipment leg completed successfully!");
    } catch (err) {
      console.error("Error completing shipment leg:", err);
      alert("Failed to complete shipment leg. " + err.message);
    }
  };
  
  // Function to auto-release escrow
  const handleAutoReleaseEscrow = async (txId) => {
    if (!contract) return;
    
    try {
      const tx = await contract.autoReleaseEscrow(txId);
      await tx.wait();
      
      // Reload data after release
      await loadUserData(contract, userAddress);
      
      alert("Escrow released successfully!");
    } catch (err) {
      console.error("Error releasing escrow:", err);
      alert("Failed to release escrow. " + err.message);
    }
  };
  
  // Function to dispute purchase
  const handleDisputePurchase = async (txId) => {
    if (!contract) return;
    
    try {
      const tx = await contract.disputePurchase(txId);
      await tx.wait();
      
      // Reload data after dispute
      await loadUserData(contract, userAddress);
      
      alert("Dispute filed successfully!");
    } catch (err) {
      console.error("Error filing dispute:", err);
      alert("Failed to file dispute. " + err.message);
    }
  };

  const handleToggleSale = async (batchId, isForSale, price) => {
    if (!contract) return;
    
    try {
      const priceInWei = ethers.parseEther(price.toString());
      const tx = await contract.toggleSale(batchId, isForSale, priceInWei);
      await tx.wait();
      
      // Reload data after toggling sale status
      await loadUserData(contract, userAddress);
      
      alert(isForSale ? "Batch listed for sale successfully!" : "Batch removed from sale successfully!");
    } catch (err) {
      console.error("Error toggling sale status:", err);
      alert("Failed to update sale status. " + err.message);
    }
  };

  // Function to open shipment dialog
  const openShipmentDialog = (batchId, location) => {
    setSelectedBatchId(batchId);
    setShipmentFrom(location || "");
    setShipmentTo("");
    setShipmentDetails(""); // Reset details
    setIsShipmentDialogOpen(true);
  };

  const openNewLegDialog = (batchId, location) => {
    setSelectedBatchId(batchId);
    setShipmentFrom(location || "");
    setShipmentTo("");
    setIsNewLegDialogOpen(true);
  };
  
  const openCompleteLegDialog = (batchId, transactionId) => {
    setSelectedBatchId(batchId);
    setSelectedTransactionId(transactionId);
    console.log("This is batch shipment", batchShipments[219]);
    setSelectedLegIndex(batchShipments[batchId] ? batchShipments[batchId].length - 1 : 0);
    setIsCompleteLegDialogOpen(true);
  };

  return (
    <>
      <div className="min-vh-100 bg-white">
        {/* Main Content */}
        <div className="container-fluid px-4 py-4">
          {/* Profile Info Section */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <Avatar
                  src={avatar}
                  sx={{
                    width: 80,
                    height: 80,
                    border: "2px solid white",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    marginRight: 2
                  }}
                />
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <Typography variant="h5" className="fw-bold">
                      {formattedAddress}
                    </Typography>
                    <VerifiedIcon color="primary" />
                  </div>
                  <Typography variant="body2" color="text.secondary">
                    {userTransactions.length} transactions · {userBatches.length} batches
                  </Typography>
                </div>
              </div>
            </div>
            <div className="col-md-6 d-flex justify-content-md-end align-items-center mt-3 mt-md-0">
              <Chip 
                label={userRole === "both" ? "Buyer & Seller" : userRole === "buyer" ? "Buyer" : userRole === "seller" ? "Seller" : "New User"} 
                color={userRole === "both" ? "success" : userRole === "buyer" ? "primary" : userRole === "seller" ? "secondary" : "default"}
                sx={{ fontSize: "1rem", padding: "20px 10px" }}
              />
            </div>
          </div>

          {/* Tabs Section */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {[
                "Transactions",
                "Batches",
              ].map((tab) => (
                <Tab
                  key={tab}
                  label={tab}
                  value={tab}
                  sx={{
                    textTransform: "none",
                    fontWeight: activeTab === tab ? 600 : 400,
                  }}
                />
              ))}
            </Tabs>
          </Box>

          {/* Search and Filter Section */}
          <div className="d-flex align-items-center gap-3 mt-4">
            <div className="d-flex align-items-center flex-grow-1">
              <FilterAltIcon sx={{ marginRight: 1 }} />
              <TextField
                size="small"
                placeholder={activeTab === "Transactions" ? "Search by transaction ID" : "Search by batch ID"}
                variant="outlined"
                fullWidth
                sx={{ maxWidth: 400 }}
              />
            </div>
            <div className="d-flex gap-2">
              <SwapVertIcon />
              <ViewModuleIcon />
            </div>
          </div>

          {/* Content Sections */}
            {activeTab === "Transactions" && (
              <TransactionTable
                transactions={userTransactions}
                loading={loading}
                error={error}
                batchShipments={batchShipments}
                userAddress={userAddress}
                itemsPerPage={itemsPerPage}
                currentPage={currentTransactionPage}
                onPageChange={handleTransactionPageChange}
                onConfirmPurchase={handleConfirmPurchase}
                onDisputePurchase={handleDisputePurchase}
                onAutoReleaseEscrow={handleAutoReleaseEscrow}
                onOpenShipmentDialog={openShipmentDialog}
                onOpenNewLegDialog={openNewLegDialog}
                onOpenCompleteLegDialog={openCompleteLegDialog}
              />
            )}

            {activeTab === "Batches" && (
              <BatchesTable
                batches={userBatches}
                loading={loading}
                error={error}
                batchShipments={batchShipments}
                itemsPerPage={itemsPerPage}
                currentPage={currentBatchPage}
                onPageChange={handleBatchPageChange}
                onToggleSale={handleToggleSale}
              />
            )}

        </div>

    {/* Replace the dialog components with new ones */}
    <StartShipmentDialog
      open={isShipmentDialogOpen}
      onClose={() => setIsShipmentDialogOpen(false)}
      batchId={selectedBatchId}
      shipmentFrom={shipmentFrom}
      shipmentTo={shipmentTo}
      shipmentDetails={shipmentDetails}
      onShipmentFromChange={setShipmentFrom}
      onShipmentToChange={setShipmentTo}
      onShipmentDetailsChange={setShipmentDetails}
      onStartShipment={handleStartShipment}
    />

    <NewLegDialog
      open={isNewLegDialogOpen}
      onClose={() => setIsNewLegDialogOpen(false)}
      batchId={selectedBatchId}
      shipmentFrom={shipmentFrom}
      shipmentTo={shipmentTo}
      shipmentDetails={shipmentDetails}
      onShipmentFromChange={setShipmentFrom}
      onShipmentToChange={setShipmentTo}
      onShipmentDetailsChange={setShipmentDetails}
      onAddShipmentLeg={handleAddShipmentLeg}
    />

    <CompleteLegDialog
      open={isCompleteLegDialogOpen}
      onClose={() => setIsCompleteLegDialogOpen(false)}
      batchId={selectedBatchId}
      shipments={batchShipments}
      selectedLegIndex={selectedLegIndex}
      onCompleteLeg={handleCompleteLeg}
    />

      </div>
    </>
  );
}