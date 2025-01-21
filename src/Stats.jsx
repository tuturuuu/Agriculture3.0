import "./css/HarvestTable.css";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import NavigationBar from "./components/NavigationBar";
import SearchIcon from "@mui/icons-material/Search";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Footer from "./components/Footer";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper
} from '@mui/material';
import { useState } from 'react';

const Stats = () => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('price');
  
  const initialHarvests = [
      {
        name: "Golden Grain",
        image: "src/assets/mockProductsTable/Simple01.png",
        price: "0.08",
        status: "Fresh",
        batchNumber: "9177",
        harvestDate: "2023-11-01",
        expirationDate: "2024-04-01",
      },
      {
        name: "Mekong Pearl",
        image: "src/assets/mockProductsTable/Simple02.png",
        price: "0.18",
        status: "Expired",
        batchNumber: "3064",
        harvestDate: "2023-05-15",
        expirationDate: "2023-10-15",
      },
      {
        name: "Harvest Fresh Rice",
        image: "src/assets/mockProductsTable/Simple03.png",
        price: "0.03",
        status: "Pending",
        batchNumber: "9195",
        harvestDate: "2023-09-10",
        expirationDate: "2024-02-10",
      },
      {
        name: "Highland Brew",
        image: "src/assets/mockProductsTable/Simple04.png",
        price: "0.05",
        status: "Expired",
        batchNumber: "3128",
        harvestDate: "2023-02-20",
        expirationDate: "2023-07-20",
      },
      {
        name: "Robusta Reserve",
        image: "src/assets/mockProductsTable/Simple05.png",
        price: "0.09",
        status: "Pending",
        batchNumber: "9892",
        harvestDate: "2023-10-01",
        expirationDate: "2024-03-01",
      },
      {
        name: "Green Label Harvest",
        image: "src/assets/mockProductsTable/Simple06.png",
        price: "0.21",
        status: "Expired",
        batchNumber: "9011",
        harvestDate: "2023-03-05",
        expirationDate: "2023-08-05",
      },
  ];

  
  const [harvests, setHarvests] = useState(initialHarvests);

  const handleSortRequest = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);

    const sortedHarvests = [...harvests].sort((a, b) => {
      // Simple numeric comparison for price
      return isAsc 
        ? Number(a.price) - Number(b.price)
        : Number(b.price) - Number(a.price);
    });

    setHarvests(sortedHarvests);
  };

  return (
    <>
      <NavigationBar />
      <section className="p-5" style={{ marginBottom: "100px" }}>
        <h1 className="fs-3 fw-bold mt-5 mb-3">Agriculture stats</h1>
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex gap-3">
            <button className="btn btn-light">Trending</button>
            <button className="btn btn-light">Top</button>
            <button className="btn btn-light">Liked</button>
            <div className="dropdown">
              <button
                className="btn btn-light dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                All categories
              </button>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#">Action</a></li>
                <li><a className="dropdown-item" href="#">Another action</a></li>
                <li><a className="dropdown-item" href="#">Something else here</a></li>
              </ul>
            </div>
          </div>
          <div className="search-container">
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
            />
            <SearchIcon
              sx={{
                position: "absolute",
                top: "22%",
                right: "4%",
                color: "black",
              }}
            />
          </div>
        </div>

        {/* Table */}
        <TableContainer component={Paper} className="table-responsive">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'price'}
                    direction={orderBy === 'price' ? order : 'asc'}
                    onClick={() => handleSortRequest('price')}
                  >
                    Price
                  </TableSortLabel>
                </TableCell>
                <TableCell>Current status</TableCell>
                <TableCell>Batch number</TableCell>
                <TableCell>Harvest date</TableCell>
                <TableCell>Expiration date</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {harvests.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="item-image"
                      />
                      <span className="fw-medium">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.price} ETH</TableCell>
                  <TableCell>
                    <span className={`status-badge status-${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell>{item.batchNumber}</TableCell>
                  <TableCell>{item.harvestDate}</TableCell>
                  <TableCell>{item.expirationDate}</TableCell>
                  <TableCell>
                    <button className="btn btn-link p-0">
                      <MoreHorizIcon sx={{ color: "black" }} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <div className="d-flex justify-content-between mt-3">
          <Stack spacing={1}>
            <Pagination count={10} shape="rounded" color="primary" />
          </Stack>
          <div className="d-flex gap-3 align-items-center">
            <span>Rows per page</span>
            <select aria-label="Small select example">
              <option selected value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
            </select>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Stats;