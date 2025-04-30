// Create a new file: src/components/BatchShipmentHistory.jsx
import { useState } from "react";
import { Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from "@mui/material";
import TimelineIcon from "@mui/icons-material/Timeline";

export default function BatchShipmentHistory({ batchId, shipments }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!shipments || !shipments[batchId] || shipments[batchId].length === 0) {
    return null;
  }

  return (
    <>
      <Button 
        variant="outlined" 
        size="small" 
        startIcon={<TimelineIcon />} 
        onClick={() => setIsOpen(true)}
      >
        View Journey
      </Button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} maxWidth="md">
        <DialogTitle>Shipment Journey for Batch #{batchId}</DialogTitle>
        <DialogContent>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Leg</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {shipments[batchId].map((shipment, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{shipment.from}</td>
                    <td>{shipment.to}</td>
                    <td>{new Date(Number(shipment.timestamp) * 1000).toLocaleString()}</td>
                    <td>
                      <Chip
                        label={shipment.status === 0 ? "In Transit" : "Completed"}
                        color={shipment.status === 0 ? "warning" : "success"}
                        size="small"
                      />
                    </td>
                    <td>{shipment.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}