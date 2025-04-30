// Create a new file: src/components/ShipmentDialogs.jsx
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography } from "@mui/material";

export function StartShipmentDialog({
  open,
  onClose,
  batchId,
  shipmentFrom,
  shipmentTo,
  shipmentDetails,
  onShipmentFromChange,
  onShipmentToChange,
  onShipmentDetailsChange,
  onStartShipment
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Start Shipment</DialogTitle>
      <DialogContent>
        <div className="mb-3">
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Batch ID: {batchId}
          </Typography>
        </div>
        <TextField
          margin="dense"
          label="From Location"
          fullWidth
          variant="outlined"
          value={shipmentFrom}
          onChange={(e) => onShipmentFromChange(e.target.value)}
          className="mb-3"
        />
        <TextField
          margin="dense"
          label="To Location"
          fullWidth
          variant="outlined"
          value={shipmentTo}
          onChange={(e) => onShipmentToChange(e.target.value)}
          className="mb-3"
        />
        <TextField
          margin="dense"
          label="Shipment Details"
          fullWidth
          variant="outlined"
          multiline
          rows={3}
          value={shipmentDetails}
          onChange={(e) => onShipmentDetailsChange(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={onStartShipment} 
          color="primary"
          variant="contained"
          disabled={!shipmentFrom || !shipmentTo}
        >
          Start Shipment
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function NewLegDialog({
  open,
  onClose,
  batchId,
  shipmentFrom,
  shipmentTo,
  shipmentDetails,
  onShipmentFromChange,
  onShipmentToChange,
  onShipmentDetailsChange,
  onAddShipmentLeg
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Shipment Leg</DialogTitle>
      <DialogContent>
        <div className="mb-3">
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Batch ID: {batchId}
          </Typography>
        </div>
        <TextField
          margin="dense"
          label="From Location"
          fullWidth
          variant="outlined"
          value={shipmentFrom}
          onChange={(e) => onShipmentFromChange(e.target.value)}
          className="mb-3"
        />
        <TextField
          margin="dense"
          label="Destination Location"
          fullWidth
          variant="outlined"
          value={shipmentTo}
          onChange={(e) => onShipmentToChange(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Shipment Details"
          fullWidth
          variant="outlined"
          multiline
          rows={3}
          value={shipmentDetails}
          onChange={(e) => onShipmentDetailsChange(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={onAddShipmentLeg} 
          color="primary"
          variant="contained"
          disabled={!shipmentTo}
        >
          Add Leg
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function CompleteLegDialog({
  open,
  onClose,
  batchId,
  shipments,
  selectedLegIndex,
  onCompleteLeg
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Complete Shipment Leg</DialogTitle>
      <DialogContent>
        <div className="mb-3">
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Batch ID: {batchId}
          </Typography>
          {shipments[batchId] && selectedLegIndex !== null && (
            <>
              <Typography variant="body2" gutterBottom>
                From: {shipments[batchId][selectedLegIndex]?.from}
              </Typography>
              <Typography variant="body2" gutterBottom>
                To: {shipments[batchId][selectedLegIndex]?.to}
              </Typography>
            </>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={onCompleteLeg} 
          color="success"
          variant="contained"
        >
          Complete Leg
        </Button>
      </DialogActions>
    </Dialog>
  );
}