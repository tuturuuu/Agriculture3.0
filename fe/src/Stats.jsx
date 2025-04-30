import "./css/HarvestTable.css";
import { useEffect, useState, useCallback } from "react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SearchIcon from "@mui/icons-material/Search";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {ethers} from "ethers"
import api from "./utils/api"

const Stats = () => {
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("price");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All categories");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [categories, setCategories] = useState(["All categories"]); // Default category

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories/");
        setCategories(["All categories", ...response.data]);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products/");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);
  const getFilteredData = useCallback(() => {
    return products.filter((product) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        Object.values(product)
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All categories" ||
        product.categoryName === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    // .sort((a, b) => {
    //   const isAsc = order === "asc";
    //   if (orderBy === "price") {
    //     return isAsc
    //       ? parseFloat(a.price) - parseFloat(b.price)
    //       : parseFloat(b.price) - parseFloat(a.price);
    //   }
    //   return 0;
    // });
  }, [products, searchQuery, selectedCategory]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleSortRequest = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedProducts = filteredData.slice(startIndex, endIndex);

  return (
    <>
      <section className="p-5" style={{ marginBottom: "100px" }}>
        <h1 className="fs-3 fw-bold mt-5 mb-3">Agriculture Stats</h1>
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
                {selectedCategory}
              </button>
              <ul className="dropdown-menu">
                {categories.map((category) => (
                  <li key={category}>
                    <button
                      className="dropdown-item"
                      onClick={() => handleCategoryChange(category)}
                    >
                      {category}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="search-container">
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
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
        <TableContainer component={Paper} className="table-responsive">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Current Status</TableCell>
                <TableCell>Harvest Date</TableCell>
                <TableCell>Expiration Date</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedProducts.map((product, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={
                          "http://127.0.0.1:8000/images/coffee-pictures/" +
                          product.imageSrc
                        }
                        alt={product.name}
                        className="item-image"
                      />
                      <a
                        className="fw-medium text-decoration-none text-black"
                        href={`product-details/${product.productId}`}
                      >
                        {product.name}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>{ethers.formatUnits(product.price.toString(), "ether")}{" "} ETH</TableCell>
                  <TableCell>
                    <span
                      className={`status-badge status-${product.currentStatus.toLowerCase()}`}
                    >
                      {product.currentStatus}
                    </span>
                  </TableCell>
                  <TableCell>{product.harvestDate.split("T")[0]}</TableCell>
                  <TableCell>{product.expirationDate.split("T")[0]}</TableCell>
                  <TableCell>{product.categoryName}</TableCell>
                  <TableCell>
                    <button className="btn btn-link p-0">
                      <div className="dropdown">
                        <button
                          className="btn btn-link p-0"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <MoreHorizIcon sx={{ color: "black" }} />
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <a
                              className="dropdown-item"
                              href={`product-details/${product.productId}`}
                            >
                              Learn more
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                              Buy
                            </a>
                          </li>
                        </ul>
                      </div>
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
            <Pagination
              count={totalPages}
              page={page}
              shape="rounded"
              color="primary"
              onChange={handlePageChange}
            />
          </Stack>
          <div className="d-flex gap-3 align-items-center">
            <span>Rows per page</span>
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              aria-label="Rows per page"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
          </div>
        </div>
      </section>
    </>
  );
};

export default Stats;
