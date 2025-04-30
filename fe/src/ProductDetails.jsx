import CheckoutPanel from "./components/CheckoutPanel";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "./utils/api"
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Divider,
  Box,
  Paper,
  CardMedia,
  Button,
  TextField,
  Alert,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from "@mui/material";

import {   Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineSeparator,
  TimelineContent,
  TimelineDot } from "@mui/lab/";

import {
  AccessTime as ClockIcon,
  LocationOn as MapIcon,
  VerifiedUser as CertificateIcon,
  Person as UserIcon,
  AttachMoney as DollarIcon,
  History as HistoryIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
  ArrowForward as ArrowForwardIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { ethers } from "ethers";
// Import contract ABI and address
import AgriTradeABI from "../../dapp/artifacts/contracts/AgriTrade.sol/AgriTrade.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS

const ProductDetailsPage = () => {
  const [quantity, setQuantity] = useState(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [shipmentHistory, setShipmentHistory] = useState([]);
  const [loadingShipments, setLoadingShipments] = useState(false);
  const [shipmentError, setShipmentError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        const productData = response.data;
  
        // Convert price to BigInt if needed
        productData.price = BigInt(productData.price);
  
        console.log(productData);
        setProduct(productData);

        // After setting product, fetch shipment data
        if (productData.productId) {
          fetchShipmentHistory(productData.productId);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Function to fetch shipment history
  const fetchShipmentHistory = async (batchId) => {
    setLoadingShipments(true);
    setShipmentError(null);
    
    try {
      // Connect to ethereum provider
      if (!window.ethereum) {
      throw new Error("No Ethereum provider found. Please install MetaMask.");
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        AgriTradeABI.abi,
        provider
      );
      
      // Call the getBatchJourney function
      const shipments = await contract.getBatchJourney(batchId);
      
      // Process the returned shipment data
      const processedShipments = shipments.map((shipment) => ({
        batchId: shipment.batchId.toString(),
        shipper: shipment.shipper,
        from: shipment.from,
        to: shipment.to,
        timestamp: new Date(Number(shipment.timestamp) * 1000), // Convert from seconds to milliseconds
        status: getStatusText(Number(shipment.status)),
        legIndex: Number(shipment.legIndex),
        details: shipment.details,
      }));
      
      // Sort by legIndex to ensure correct order
      processedShipments.sort((a, b) => a.legIndex - b.legIndex);
      
      setShipmentHistory(processedShipments);
    } catch (error) {
      console.error("Error fetching shipment history:", error);
      setShipmentError(error.message);
    } finally {
      setLoadingShipments(false);
    }
  };

  // Helper function to convert status enum to text
  const getStatusText = (statusCode) => {
    const statuses = ["Not Shipped", "In Transit", "Delivered", "Confirmed", "Disputed"];
    return statuses[statusCode] || "Unknown";
  };

  const handleQuantityChange = (newQuantity) => {
    if (product && newQuantity >= 1 && newQuantity <= product.quantity) {
      setQuantity(newQuantity);
    }
  };

  const handleBuy = () => {
    setIsCheckoutOpen(true);
  };

  const formatDate = (timestamp) => {
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString();
    }
    return new Date(timestamp).toLocaleDateString();
  };
  
  const formatAddress = (address) =>
    `${address?.slice(0, 6)}...${address?.slice(-4)}`;

  return (
    <>
      <div className="container py-4">
        {loading ? (
          <Typography>Loading...</Typography>
        ) : product ? (
          <Card>
            <Grid container>
              {/* Product Image */}
              <Grid item xs={12} md={6}>
                <CardMedia
                  component="img"
                  height="400"
                  image={
                    "http://127.0.0.1:8000/images/coffee-pictures/" +
                      product?.imageSrc || "/default-image.jpg"
                  }
                  alt={product?.name || "Product Image"}
                  sx={{ objectFit: "cover", borderRadius: "4px", p: 2 }}
                />
              </Grid>

              {/* Product Header Info */}
              <Grid item xs={12} md={6}>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={3}
                  >
                    <div>
                      <Typography variant="h4" gutterBottom>
                        {product?.name}
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                        {product?.tags?.map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Box>
                    </div>
                    <Chip
                      label={product?.currentStatus}
                      color={
                        product?.currentStatus === "Fresh" ? "success" : "error"
                      }
                      variant="filled"
                    />
                  </Box>

                  {/* Price and Buy Section */}
                  <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: "grey.50" }}>
                    <Typography variant="h5" color="primary" gutterBottom>
                      {ethers.formatUnits(product?.price.toString(), "ether")}{" "}
                      ETH
                    </Typography>

                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <TextField
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                          handleQuantityChange(Number(e.target.value))
                        }
                        inputProps={{ min: 1, max: product?.availableQuantity }}
                        size="small"
                        sx={{ width: "80px" }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= product?.availableQuantity}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>

                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleBuy}
                      sx={{ mb: 2 }}
                    >
                      Buy Now (Total:{" "}
                      {(quantity || 1) *
                        (ethers.formatUnits(
                          product?.price.toString(),
                          "ether",
                        ) || 0)}
                      )
                    </Button>

                    <Box display="flex" gap={2} alignItems="center">
                      <InventoryIcon color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Available: {product?.quantity} kg
                      </Typography>
                    </Box>
                  </Paper>

                  {/* Product Description */}
                  <Typography variant="h6" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {product?.description}
                  </Typography>

                  <Typography variant="body1" gutterBottom>
                    <strong>ID:</strong> {product?.productId}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Category:</strong> {product?.categoryName}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <MapIcon /> <strong>Region:</strong> {product?.region}
                  </Typography>
                </CardContent>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />
            
            {/* Shipment History Timeline */}
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ShippingIcon sx={{ mr: 1 }} /> Batch Journey
              </Typography>
              
              {loadingShipments ? (
                <Typography>Loading shipment history...</Typography>
              ) : shipmentError ? (
                <Alert severity="error">
                  Error loading shipment data: {shipmentError}
                </Alert>
              ) : shipmentHistory.length > 0 ? (
                <Timeline position="alternate" sx={{ p: 0 }}>
                  {shipmentHistory.map((shipment, index) => (
                    <TimelineItem key={index}>
                      <TimelineSeparator>
                        <TimelineDot 
                          color={
                            shipment.status === "Delivered" || shipment.status === "Confirmed" 
                              ? "success" 
                              : shipment.status === "In Transit" 
                                ? "primary" 
                                : "grey"
                          }
                        >
                          {index === 0 ? <InfoIcon /> : <ShippingIcon />}
                        </TimelineDot>
                        {index < shipmentHistory.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {shipment.details || `Shipment Leg ${shipment.legIndex + 1}`}
                          </Typography>
                          
                          <Box display="flex" alignItems="center" gap={1} mt={1}>
                            <MapIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {shipment.from} <ArrowForwardIcon fontSize="small" sx={{ mx: 1 }} /> {shipment.to}
                            </Typography>
                          </Box>
                          
                          <Box display="flex" alignItems="center" gap={1} mt={1}>
                            <ClockIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {formatDate(shipment.timestamp)}
                            </Typography>
                          </Box>
                          
                          <Chip 
                            label={shipment.status} 
                            size="small"
                            color={
                              shipment.status === "Delivered" || shipment.status === "Confirmed" 
                                ? "success" 
                                : shipment.status === "In Transit" 
                                  ? "primary" 
                                  : "default"
                            }
                            sx={{ mt: 1 }}
                          />
                          
                          {shipment.details && (
                            <Typography variant="body2" color="text.secondary" mt={1}>
                              {shipment.details}
                            </Typography>
                          )}
                        </Paper>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              ) : (
                <Alert severity="info">
                  No shipment history available for this batch.
                </Alert>
              )}
            </CardContent>

            <Divider sx={{ my: 2 }} />

            {/* Transaction History */}
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Transaction History
              </Typography>
              <Box>
                {product?.priceHistory?.map((price, index) => (
                  <Paper
                    key={index}
                    elevation={1}
                    sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}
                  >
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <ClockIcon />
                          <Typography>
                            {formatDate(product?.transactionTimestamps?.[index])}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <DollarIcon />
                          <Typography>
                            <strong>{price} ETH</strong>
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <UserIcon />
                          <Typography color="text.secondary">
                            Owner: {formatAddress(product?.ownerAddress)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Typography>Error: Product not found.</Typography>
        )}
      </div>

      <CheckoutPanel
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={product}
        quantity={quantity}
      />
    </>
  );
};

export default ProductDetailsPage;