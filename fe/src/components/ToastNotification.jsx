import React, { useEffect, useState } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";

const ToastNotification = ({ message, onClose, duration = 5000 }) => {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(progressInterval);
          return 0;
        }
        return prev - 100 / (duration / 100);
      });
    }, 100);

    const timeoutId = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timeoutId);
    };
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className="position-fixed start-0 bottom-0 m-4 bg-white shadow rounded-3 overflow-hidden"
      style={{
        width: "320px",
        zIndex: 1060,
        opacity: isVisible ? 1 : 0,
        transition: "all 0.3s ease-in-out",
        transform: `translateY(${isVisible ? "0" : "20px"})`,
      }}
    >
      <div className="p-3">
        <div className="d-flex align-items-center gap-2 mb-1">
          <CheckCircleIcon
            className="text-success"
            style={{ fontSize: "20px" }}
          />
          <span className="fw-semibold flex-grow-1">Purchase successful!</span>
          <button
            className="btn btn-link p-0 text-dark"
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
          >
            <CloseIcon style={{ fontSize: "20px" }} />
          </button>
        </div>
        <p className="text-secondary mb-0 small">{message}</p>
      </div>
      <div
        className="bg-primary"
        style={{
          height: "4px",
          width: `${progress}%`,
          transition: "width 0.1s linear",
        }}
      />
    </div>
  );
};

export default ToastNotification;
