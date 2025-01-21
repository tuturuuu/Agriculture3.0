import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PropTypes from "prop-types";

const CartPanel = ({ isOpen, onClose, cartItems }) => {
  const totalPrice = cartItems
    .reduce((total, item) => total + parseFloat(item.price), 0)
    .toFixed(4);
  const totalUSD = (totalPrice * 1500).toFixed(2);

  return (
    <>
      {isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ 
            zIndex: 1040,
            transition: 'opacity 0.3s ease-in-out',
            opacity: isOpen ? 1 : 0
          }}
          onClick={onClose}
        />
      )}

      <div 
        className="position-fixed top-0 end-0 h-100 bg-white shadow"
        style={{ 
          width: '384px', 
          zIndex: 1050,
          transform: `translateX(${isOpen ? '0' : '100%'})`,
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        <div className="d-flex align-items-center justify-content-between p-4 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <h2 className="fs-4 fw-semibold mb-0">Your cart</h2>
            <InfoOutlinedIcon className="text-secondary" size={16} />
          </div>
          <button
            onClick={onClose}
            className="btn btn-link text-dark p-1"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <span className="text-secondary">{cartItems.length} items</span>
            <button className="btn btn-link text-secondary p-0">
              Clear all
            </button>
          </div>

          <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {cartItems.map((item) => (
              <div key={item.id} className="d-flex gap-3 mb-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="rounded"
                  style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                />
                <div className="flex-grow-1">
                  <h3 className="fw-medium mb-1 fs-5">{item.name}</h3>
                  <p className="text-secondary small mb-1">{item.creator}</p>
                  <p className="text-secondary small mb-0">
                    Creator earnings: {item.earnings}
                  </p>
                </div>
                <div className="text-end me-2">
                  <p className="fw-medium mb-0">{item.price} ETH</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="position-absolute bottom-0 start-0 w-100 p-4 border-top bg-white">
          <div className="d-flex justify-content-between mb-2">
            <span>Total price</span>
            <span className="fw-semibold">{totalPrice} ETH</span>
          </div>
          <div className="d-flex justify-content-between small text-secondary mb-4">
            <span>USD Price</span>
            <span>${totalUSD}</span>
          </div>
          <button className="btn btn-primary w-100 py-3 mb-2 fw-semibold">
            Complete purchase
          </button>
        </div>
      </div>
    </>
  );
};

CartPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  cartItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      creator: PropTypes.string.isRequired,
      earnings: PropTypes.string.isRequired,
      price: PropTypes.string.isRequired
    })
  ).isRequired
};

export default CartPanel;
