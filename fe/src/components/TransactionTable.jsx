// src/components/TransactionTable.jsx
import { Typography, Button, Chip, Pagination, Tooltip } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import BatchShipmentHistory from "./BatchShipmentHistory";

export default function TransactionTable({ 
  transactions, 
  loading, 
  error, 
  batchShipments,
  userAddress,
  itemsPerPage,
  currentPage,
  onPageChange,
  onConfirmPurchase,
  onDisputePurchase,
  onAutoReleaseEscrow,
  onOpenShipmentDialog,
  onOpenNewLegDialog,
  onOpenCompleteLegDialog
}) {
  if (loading) {
    return (
      <div className="text-center my-5 py-5">
        <Typography variant="h6">Loading transactions...</Typography>
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

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center my-5 py-5">
        <Typography variant="h6" className="mb-3">
          No transactions found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start transacting on the platform to see your history here
        </Typography>
      </div>
    );
  }

  // Calculate pagination
  const pageCount = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  console.log(paginatedTransactions)

  return (
    <div className="container mt-4">
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>TX ID</th>
              <th>Product</th>
              <th>Batch ID</th>
              <th>Role</th>
              <th>Counterparty</th>
              <th>Price (ETH)</th>
              <th>Quantity</th>
              <th>Destination</th>
              <th>Date</th>
              <th>Status</th>
              <th>Journey</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.map((tx) => {
              const counterparty = tx.userRole === "buyer" ? tx.seller : tx.buyer;
              const formattedCounterparty = `${counterparty.slice(0, 6)}...${counterparty.slice(-4)}`;
              
              return (
                <tr key={tx.txId}>
                  <td>{tx.txId}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      {tx.productName || "Unknown"}
                      {tx.productName && (
                        <Tooltip title="View product details">
                          <InfoIcon fontSize="small" className="ms-1" style={{ cursor: 'pointer' }} />
                        </Tooltip>
                      )}
                    </div>
                  </td>
                  <td>{tx.batchId}</td>
                  <td>
                    <Chip 
                      label={tx.userRole === "buyer" ? "Bought" : "Sold"} 
                      color={tx.userRole === "buyer" ? "primary" : "secondary"}
                      size="small"
                    />
                  </td>
                  <td>{formattedCounterparty}</td>
                  <td>{tx.price}</td>
                  <td>{tx.quantity}</td>
                  <td>{tx.destination || "Not specified"}</td>
                  <td>{tx.apiTimestamp || tx.timestamp}</td>
                  <td>
                    <Chip 
                      label={tx.status} 
                      color={
                        tx.status === "Not Shipped" ? "default" : 
                        tx.status === "In Transit" ? "warning" : 
                        tx.status === "Delivered" ? "info" : 
                        tx.status === "Confirmed" ? "success" : "error"
                      }
                      size="small"
                    />
                  </td>
                  <td>
                    <BatchShipmentHistory 
                      batchId={tx.batchId} 
                      shipments={batchShipments} 
                    />
                  </td>
                  <td>
                    {tx.userRole === "buyer" && tx.status === "Delivered" && (
                      <div className="d-flex gap-2">
                        <Button 
                          variant="contained" 
                          color="success" 
                          size="small"
                          onClick={() => onConfirmPurchase(tx.txId)}
                        >
                          Confirm
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          onClick={() => onDisputePurchase(tx.txId)}
                        >
                          Dispute
                        </Button>
                      </div>
                    )}
                    {tx.userRole === "seller" && tx.status === "Delivered" && (
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        size="small"
                        onClick={() => onAutoReleaseEscrow(tx.txId)}
                      >
                        Auto Release
                      </Button>
                    )}
                    
                    {tx.userRole === "seller" && tx.status === "Not Shipped" && (
                      <Button 
                        variant="contained" 
                        color="primary" 
                        size="small"
                        onClick={() => onOpenShipmentDialog(tx.batchId, tx.location || "")}
                      >
                        Ship
                      </Button>
                    )}
                    
                    {tx.userRole === "seller" && tx.status === "In Transit" && (
                      <div className="d-flex flex-column gap-2">
                        <Button 
                          variant="outlined" 
                          color="primary" 
                          size="small"
                          onClick={() => onOpenNewLegDialog(tx.batchId, tx.location || "")}
                        >
                          Add Leg
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="success" 
                          size="small"
                          onClick={() => onOpenCompleteLegDialog(tx.batchId, tx.txId)}
                        >
                          Complete Leg
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
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
    </div>
  );
}