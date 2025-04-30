import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import IconButton from "@mui/material/IconButton";
import PropTypes from "prop-types";
import {ethers} from "ethers"
export default function CustomCard(props) {
  return (
    <div
      onClick={() => {
        window.location.href = "/product-details/" + props.productId;
      }}
      className="custom-card-container"
    >
      <Card
        sx={{ maxWidth: 345, minWidth: 300, minHeight: 300 }}
        className="border-bottom position-relative custom-card"
      >
        <div className="position-relative">
          <CardMedia
            sx={{ height: 140 }}
            image={"http://127.0.0.1:8000/images/coffee-pictures/" + props.imageSrc}
            title={props.name}
            className="card-media"
          />

          <span style={{ top: "5%", right: "5%", position: "absolute" }}>
            <div
              style={{ position: "relative", width: "45px", height: "45px" }}
            >
              <img
                src="/src/assets/svg/eclipse.svg"
                alt=""
                width="100%"
                height="100%"
              />
              <span
                style={{
                  position: "absolute",
                  top: "55%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <IconButton
                  aria-label="add to favorites"
                  className="text-white favorite-button"
                >
                  {props.isFavourite ? (
                    <FavoriteIcon />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
                </IconButton>
              </span>
            </div>
          </span>
        </div>
        <CardContent className="card-content">
          <Typography
            gutterBottom
            variant="h5"
            component="div"
            className="fw-bold"
          >
            {props.name}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {props.description}
          </Typography>

          <div className="d-flex align-items-center gap-2 justify-content-start mt-3">
            <img src="/src/assets/svg/eth.svg" alt="" width={"35"} />
            <Typography variant="body2" className="fw-medium pt-1">
              {ethers.formatUnits(props.price.toString(), "ether")}{" "} ETH
            </Typography>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

CustomCard.propTypes = {
  imageSrc: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
  isFavourite: PropTypes.bool.isRequired,
};
