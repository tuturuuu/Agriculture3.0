import { useEffect, useState } from "react";
import {
  TextField,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import "./css/CreateProduct.css";
import abi from "../../dapp/artifacts/contracts/AgriTrade.sol/AgriTrade.json";
import { ethers } from "ethers";
import api from "./utils/api"

export default function CreateProduct() {
  const [formData, setFormData] = useState({
    productName: "",
    label: "",
    category: "",
    quantity: "",
    price: "",
    region: "",
    harvestDate: "",
    expirationDate: "",
    currentStatus: "Fresh",
    isForSale: false,
    certificationInfo: "",
    imageSrc: "",
    description: "", // Added description field
  });

  const [image, setImage] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [categories, setCategories] = useState(["All categories"]); // Default category

  useEffect(() => {
    console.log(formData.isForSale);
  });

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        setCategories(["All categories", ...response.data]);
        console.log(categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Certification mapping to IDs
  const certificationMap = {
    organic: 1,
    "fair-trade": 2,
    none: 3,
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleCreateProduct = async () => {
    try {

      const token = localStorage.getItem("token");
      if (!token) {
        setSnackbarMessage("Please log in to create a product.");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
        return;
      }

      // Validate form
      const requiredFields = [
        "productName",
        "category",
        "quantity",
        "price",
        "region",
        "harvestDate",
      ];
      const missingFields = requiredFields.filter((field) => !formData[field]);

      if (missingFields.length > 0) {
        setSnackbarMessage(`Please fill in: ${missingFields.join(", ")}`);
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
        return;
      }

      // Connect to MetaMask
      if (!window.ethereum) {
        setSnackbarMessage("MetaMask not found. Please install it.");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Contract instance
      const contract = new ethers.Contract(
        import.meta.env.VITE_CONTRACT_ADDRESS, // Replace with actual contract address
        abi.abi,
        signer,
      );

      // Convert form data
      const isForSale = formData.isForSale;
      const quantity = parseInt(formData.quantity);
      const price = ethers.parseUnits(formData.price, "ether").toString();
      console.log(price);
      const location = formData.region;
      // Send transaction
      const tx = await contract.createBatch(
        isForSale,
        price,
        location,
        quantity,
      );

      await tx.wait(); // Wait for transaction confirmation
      
      const productId = await contract.batchCounter()

      // Upload image first if one was selected
      if (image) {
        const formDataImage = new FormData();
        formDataImage.append("file", image);
        console.log(image);
        try {
          const imageResponse = await api.post(
            "/images/coffee-pictures",
            formDataImage,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            },
          );

          formData.imageSrc = image.name;
        } catch (error) {
          console.log(error);
        }
      }
      console.log(await signer.getAddress());
      // Prepare product data`
      const productData = {
        name: formData.productName,
        categoryId: formData.category,
        quantity: parseInt(formData.quantity),
        price: price,
        imageSrc: formData.imageSrc,
        region: formData.region,
        harvestDate: formData.harvestDate,
        expirationDate: formData.expirationDate,
        currentStatus: formData.currentStatus,
        isForSale: formData.isForSale,
        ownerAddress: await signer.getAddress(),
        certificateId: certificationMap[formData.certificationInfo],
        productId: productId.toString(),
        description: formData.description,
      };

      // Send to backend
      const response = await api.post(
        "/products/",
        productData,
      );

      setSnackbarMessage("Product created successfully!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);

      // Reset form
      setFormData({
        productName: "",
        category: "",
        quantity: "",
        price: "",
        region: "",
        harvestDate: "",
        expirationDate: "",
        currentStatus: "Fresh",
        isForSale: false,
        certificationInfo: "",
        description: "", // Reset description field
      });
      setImage(null);
    } catch (error) {
      console.error(
        "Product creation failed",
        error.response ? error.response.data : error.message,
      );
      setSnackbarMessage("Failed to create product. Please try again.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  return (
    <>
      <div className="container mt-5" style={{ marginBottom: "100px" }}>
        <h1 className="mb-3">Create new product</h1>
        <p className="text-muted mb-4">
          Fill the form to create your new product
        </p>

        <div className="row gap-5">
          <div className="col-md-5 form-area">
            {/* Left column - Form Fields */}
            <p className="fw-semibold p-1 fs-5">Product information:</p>
            <div className="mb-3">
              <TextField
                fullWidth
                label="Product Name"
                variant="outlined"
                value={formData.productName}
                onChange={(e) =>
                  setFormData({ ...formData, productName: e.target.value })
                }
              />
            </div>

            <div className="mb-3">
              <FormControl fullWidth>
                <InputLabel>Category *</InputLabel>
                <Select
                  value={formData.category}
                  label="Category *"
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  {categories.map((category, index) => (
                    <MenuItem key={index + 1} value={index + 1}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            {/* Description Field */}
            <div className="mb-3">
              <TextField
                fullWidth
                label="Description"
                variant="outlined"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe your product's qualities, origin story, or special characteristics"
              />
            </div>

            {/* New Quantity Field */}
            <div className="mb-3">
              <TextField
                fullWidth
                label="Quantity (kg) *"
                type="number"
                variant="outlined"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                InputProps={{
                  inputProps: { min: 0 },
                }}
              />
            </div>

            {/* New Price Field */}
            <div className="mb-3">
              <TextField
                fullWidth
                label="Price per kg ($) *"
                type="number"
                variant="outlined"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                InputProps={{
                  inputProps: { min: 0, step: "0.01" },
                }}
              />
            </div>

            <div className="mb-3">
              <TextField
                fullWidth
                label="Region/Geographic Origin *"
                variant="outlined"
                error={false}
                value={formData.region}
                onChange={(e) =>
                  setFormData({ ...formData, region: e.target.value })
                }
              />
            </div>

            <div className="mb-3">
              <TextField
                fullWidth
                label="Harvest Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.harvestDate}
                onChange={(e) =>
                  setFormData({ ...formData, harvestDate: e.target.value })
                }
              />
            </div>

            <div className="mb-3">
              <TextField
                fullWidth
                label="Expiration Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.expirationDate}
                onChange={(e) =>
                  setFormData({ ...formData, expirationDate: e.target.value })
                }
              />
            </div>

            <div className="mb-3">
              <FormControl fullWidth>
                <InputLabel>Certification Info *</InputLabel>
                <Select
                  value={formData.certificationInfo}
                  label="Certification Info *"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      certificationInfo: e.target.value,
                    })
                  }
                >
                  <MenuItem value="organic">Organic Certified</MenuItem>
                  <MenuItem value="fair-trade">Fair Trade</MenuItem>
                  <MenuItem value="none">None</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="mb-3">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isForSale} // Ensure it's always a boolean
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isForSale: e.target.checked, // Use boolean directly
                      })
                    }
                  />
                }
                label="Is for sale?"
              />
            </div>
          </div>

          <div className="col-md-5">
            <div
              className="upload-area"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-input"
                className="d-none"
                accept="image/*"
                onChange={handleFileSelect}
              />
              <label htmlFor="file-input" className="upload-label">
                <UploadIcon fontSize="large" />
                <p className="mt-3">Drag and drop to upload image</p>
                {image && (
                  <p className="text-success">File selected: {image.name}</p>
                )}
              </label>
            </div>

            <div className="mt-4">
              <img
                src="src\assets\png\rocket-moon.png"
                alt="Decorative"
                className="rocket-image"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Button
            variant="contained"
            color="primary"
            className="me-3"
            sx={{ bgcolor: "black", "&:hover": { bgcolor: "#333" } }}
            onClick={handleCreateProduct}
          >
            CREATE
          </Button>
          <Button
            variant="outlined"
            sx={{
              color: "black",
              border: "2px dashed black",
              transition: "all 0.3s ease",
              "&:hover": {
                border: "2px solid black",
              },
            }}
          >
            CANCEL
          </Button>
        </div>
      </div>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}