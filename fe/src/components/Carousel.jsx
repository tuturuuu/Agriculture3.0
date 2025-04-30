import PropTypes from "prop-types";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

export default function Carousel({ mockData, CardComponent, carouselId }) {
  const cardGroups = [];

  let i = 0;
  const smallScreenSize = window.matchMedia("(max-width: 768px)").matches;
  const mediumScreenSize = window.matchMedia(
    "(min-width: 769px) and (max-width: 992px)",
  ).matches;
  const increment = smallScreenSize ? 1 : mediumScreenSize ? 2 : 4;
  while (i < mockData.length) {
    cardGroups.push(mockData.slice(i, i + increment));
    i += increment;
  }

  return (
    <div
      id={carouselId}
      className="carousel slide position-relative"
      data-bs-ride="carousel"
    >
      <div className="carousel-inner">
        {cardGroups.map((group, groupIndex) => (
          <div
            key={groupIndex}
            className={`carousel-item ${groupIndex === 0 ? "active" : ""}`}
          >
            <div
              className="d-flex justify-content-center align-items-center gap-5"
              style={{ width: "75%", margin: "0 auto" }}
            >
              {group.map((item, index) => (
                <CardComponent key={index} {...item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        className="position-absolute top-50 translate-middle-y"
        id="prevArrow"
      >
        <a role="button" data-bs-target={`#${carouselId}`} data-bs-slide="prev">
          <ArrowBackIosIcon aria-hidden="true" className="text-black" />
          <span className="visually-hidden">Next</span>
        </a>
      </div>

      <div
        className="position-absolute top-50 translate-middle-y"
        style={{ right: "5%" }}
        id="nextArrow"
      >
        <a role="button" data-bs-target={`#${carouselId}`} data-bs-slide="next">
          <ArrowForwardIosIcon aria-hidden="true" className="text-black" />
          <span className="visually-hidden">Next</span>
        </a>
      </div>
    </div>
  );
}

Carousel.propTypes = {
  mockData: PropTypes.array.isRequired,
  CardComponent: PropTypes.elementType.isRequired,
  carouselId: PropTypes.string.isRequired, // Unique ID for each carousel
};
