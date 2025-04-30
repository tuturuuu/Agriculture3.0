import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";

export default function CategoryCard(props) {
  return (
    <Card
      sx={{ width: 345, height: 168 }}
      className="border-bottom custom-card"
    >
      <div>
        <CardMedia
          sx={{ height: 110 }}
          image={props.imageSrc}
          title={props.title}
          className="card-media"
        />
      </div>
      <CardContent>
        <Typography
          gutterBottom
          variant="h7"
          component="div"
          className="fw-bold card-content"
        >
          {props.title}
        </Typography>
      </CardContent>
    </Card>
  );
}

CategoryCard.propTypes = {
  imageSrc: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
