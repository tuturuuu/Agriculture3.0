import "./css/HarvestTable.css"; // We'll create this CSS file next
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import NavigationBar from "./components/NavigationBar";
import SearchIcon from "@mui/icons-material/Search";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Footer from "./components/Footer";

const Stats = () => {
  const harvests = [
    {
      name: "Golden Grain",
      image: "/placeholder-image.jpg",
      price: "0.08 ETH",
      status: "Fresh",
      batchNumber: "9177",
      harvestDate: "$452.85",
      expirationDate: "$452.85",
    },
    {
      name: "Mekong Pearl",
      image: "/placeholder-image.jpg",
      price: "0.18 ETH",
      status: "Expired",
      batchNumber: "3064",
      harvestDate: "$901.31",
      expirationDate: "$901.31",
    },
    {
      name: "Harvest Fresh Rice",
      image: "/placeholder-image.jpg",
      price: "0.03 ETH",
      status: "Pending",
      batchNumber: "9195",
      harvestDate: "$641.20",
      expirationDate: "$641.20",
    },
    {
      name: "Highland Brew",
      image: "/placeholder-image.jpg",
      price: "0.05 ETH",
      status: "Expired",
      batchNumber: "3128",
      harvestDate: "$510.30",
      expirationDate: "$510.30",
    },
    {
      name: "Robusta Reserve",
      image: "/placeholder-image.jpg",
      price: "0.09 ETH",
      status: "Pending",
      batchNumber: "9892",
      harvestDate: "$828.90",
      expirationDate: "$828.90",
    },
    {
      name: "Green Label Harvest",
      image: "/placeholder-image.jpg",
      price: "0.21 ETH",
      status: "Expired",
      batchNumber: "9011",
      harvestDate: "$845.59",
      expirationDate: "$845.59",
    },
  ];

  return (
    <>
      <NavigationBar />
      <section className="p-5">
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
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Current status</th>
                <th>Batch number</th>
                <th>Harvest date</th>
                <th>Expiration date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {harvests.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="item-image"
                      />
                      <span className="fw-medium">{item.name}</span>
                    </div>
                  </td>
                  <td>{item.price}</td>
                  <td>
                    <span
                      className={`status-badge status-${item.status.toLowerCase()}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>{item.batchNumber}</td>
                  <td>{item.harvestDate}</td>
                  <td>{item.expirationDate}</td>
                  <td>
                    <button className="btn btn-link p-0">
                      <MoreHorizIcon sx={{ color: "black" }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-between">
          <Stack spacing={2}>
            <Pagination count={10} variant="outlined" shape="rounded"/>
          </Stack>
          <div className="d-flex gap-3">
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
