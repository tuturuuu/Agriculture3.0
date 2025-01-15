import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import IconButton from '@mui/material/IconButton';
import PropTypes from 'prop-types';

export default function CustomCard(props) {
  return (
    <Card sx={{ width: 345, height: 350}} className='border-bottom position-relative custom-card'>
      <div className='position-relative'>
        <CardMedia
          sx={{ height: 140 }}
          image={props.imageSrc}
          title={props.title}
          className='card-media'
        />

        <span style={{top: '5%', right: '5%', position: 'absolute'}} >
          <div style={{ position: 'relative', width: '45px', height: '45px' }}>
            <img src="/src/assets/svg/eclipse.svg" alt="" width="100%" height="100%"/>
            <span style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)'}}>
            <IconButton aria-label="add to favorites" className='text-white favorite-button'>
              {props.isFavourite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            </span>
          </div>
        </span>

      </div>
      <CardContent className="card-content">
        <Typography gutterBottom variant="h5" component="div" className='fw-bold'>
          {props.title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {props.description}
        </Typography>

        <div className='d-flex align-items-center mt-1'>
          <img src="/src/assets/svg/eth.svg" alt="" width={"35"}/>
          <Typography variant="body2" className='fw-medium'>
            {props.price} ETH
          </Typography>
        </div>

      </CardContent>

      <CardActions className='position-absolute bottom-0 left-0 card-actions'>
        <Button size="small">Buy now</Button>
        <Button size="small">Learn More</Button>
      </CardActions>
    </Card>
  );
}

CustomCard.propTypes = {
  imageSrc: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  isFavourite: PropTypes.bool.isRequired
};