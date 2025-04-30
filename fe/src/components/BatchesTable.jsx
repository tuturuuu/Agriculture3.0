import { Typography, Chip, Pagination, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useState } from "react";
import BatchShipmentHistory from "./BatchShipmentHistory";

export default function BatchesTable({
  batches,
  loading,
  error,
  batchShipments, 
  itemsPerPage,
  currentPage,
  onPageChange,
  onToggleSale
}) {
  const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [newPrice, setNewPrice] = useState("");
  const [isForSale, setIsForSale] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const openSaleDialog = (batch) => {
    setSelectedBatch(batch);
    setIsForSale(!batch.isForSale);
    setNewPrice(batch.price);
    setIsSaleDialogOpen(true);
  };

  const handleToggleSale = async () => {
    if (!selectedBatch) return;
    
    try {
      setIsProcessing(true);
      await onToggleSale(selectedBatch.batchId, isForSale, newPrice);
      
      setIsSaleDialogOpen(false);
      setIsProcessing(false);
    } catch (err) {
      console.error("Error toggling sale status:", err);
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5 py-5">
        <Typography variant="h6">Loading batches...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center my-5 py-5">
        <Typography variant="h6" color="error">{error}</Typography>
      </div>
    );
  }

  if (!batches || batches.length === 0) {
    return (
      <div className="text-center my-5 py-5">
        <Typography variant="h6" className="mb-3">
          No batches found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create batches to see them here
        </Typography>
      </div>
    );
  }

  // Calculate pagination
  const pageCount = Math.ceil(batches.length / itemsPerPage);
  const paginatedBatches = batches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Typography variant="h6">Your Batches</Typography>
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Batch ID</th>
              <th>Location</th>
              <th>Quantity</th>
              <th>Available</th>
              <th>For Sale</th>
              <th>Price (ETH)</th>
              <th>State</th>
              <th>Journey</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBatches.map((batch) => (
              <tr key={batch.batchId}>
                <td>{batch.batchId}</td>
                <td>{batch.location}</td>
                <td>{batch.quantity}</td>
                <td>{batch.available}</td>
                <td>
                  <Chip 
                    label={batch.isForSale ? "Yes" : "No"} 
                    color={batch.isForSale ? "success" : "default"}
                    size="small"
                  />
                </td>
                <td>{batch.price}</td>
                <td>
                  <Chip 
                    label={batch.state} 
                    color={
                      batch.state === "Available" ? "success" : 
                      batch.state === "Purchased" ? "primary" : 
                      batch.state === "Shipped" ? "warning" : 
                      batch.state === "Delivered" ? "info" : "default"
                    }
                    size="small"
                  />
                </td>
                <td>
                  <BatchShipmentHistory 
                    batchId={batch.batchId} 
                    shipments={batchShipments} 
                  />
                </td>
                <td>
                  {batch.isOwner && batch.state === "Available" && (
                    <Button 
                      variant="outlined" 
                      color={batch.isForSale ? "error" : "success"}
                      size="small"
                      onClick={() => openSaleDialog(batch)}
                    >
                      {batch.isForSale ? "Remove Listing" : "List For Sale"}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination for batches */}
      {pageCount > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination
            count={pageCount}
            page={currentPage}
            onChange={onPageChange}
            color="primary"
            size="large"
          />
        </div>
      )}

      {/* Toggle Sale Dialog */}
      <Dialog 
        open={isSaleDialogOpen} 
        onClose={() => !isProcessing && setIsSaleDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isForSale ? "List Batch For Sale" : "Remove From Sale"}
        </DialogTitle>
        <DialogContent>
          {isForSale ? (
            <>
              <Typography variant="body1" gutterBottom>
                Set the price for this batch in ETH:
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                label="Price (ETH)"
                type="number"
                fullWidth
                variant="outlined"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                disabled={isProcessing}
                InputProps={{ inputProps: { min: 0, step: 0.001 } }}
              />
            </>
          ) : (
            <Typography variant="body1">
              Are you sure you want to remove this batch from sale?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsSaleDialogOpen(false)} 
            color="primary"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleToggleSale} 
            color="primary"
            variant="contained"
            disabled={isProcessing || (isForSale && (!newPrice || parseFloat(newPrice) <= 0))}
          >
            {isProcessing ? "Processing..." : isForSale ? "List For Sale" : "Remove Listing"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}