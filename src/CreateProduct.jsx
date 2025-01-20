import NavigationBar from "./components/NavigationBar";
import { useState } from "react";
import {
  TextField,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import "./css/CreateProduct.css";
import Footer from "./components/Footer";

export default function CreateProduct() {
  const [formData, setFormData] = useState({
    productName: "",
    label: "",
    category: "",
    region: "",
    harvestDate: "",
    certificationInfo: "",
  });
  const [image, setImage] = useState(null);

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

  return (
    <>
      <NavigationBar />

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
              <TextField
                fullWidth
                label="Label"
                variant="outlined"
                error={false}
                helperText=""
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
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
                  <MenuItem value="grains">Grains</MenuItem>
                  <MenuItem value="vegetables">Vegetables</MenuItem>
                  <MenuItem value="fruits">Fruits</MenuItem>
                </Select>
              </FormControl>
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

      <Footer />
    </>
  );
}
