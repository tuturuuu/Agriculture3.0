import { useState } from "react";
import NavigationBar from "./components/NavigationBar";
import Footer from "./components/Footer";
import {
  Avatar,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  Tab,
  Tabs,
} from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import IosShareIcon from '@mui/icons-material/IosShare';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

export default function Profile() {
  const [avatar, setAvatar] = useState("src/assets/png/def_ava.png");
  const [backgroundImage, setBackgroundImage] = useState("src/assets/mockProfileImage/mockBackground.png");
  const [activeTab, setActiveTab] = useState("Collected");
  const [username, setUsername] = useState("Unnamed");
  const [isVerified, setIsVerified] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUsername, setNewUsername] = useState(username);

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(URL.createObjectURL(e.target.files[0])); // Preview the uploaded avatar
    }
  };

  const handleBackgroundChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBackgroundImage(URL.createObjectURL(e.target.files[0])); // Preview the uploaded background
    }
  };

  const handleTabChange = (event, newTab) => {
    setActiveTab(newTab);
  };

  const handleDialogOpen = () => {
    setNewUsername(username); 
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleSaveUsername = () => {
    setUsername(newUsername); // Update the username
    setIsDialogOpen(false); // Close the dialog
  };

  return (
    <>
      <div className="min-vh-100 bg-white">
      <NavigationBar />
      
      {/* Main Content */}
      <div className="container-fluid px-4">
        {/* Background Image */}
        <div className="position-relative mb-4" style={{ height: "250px" }}>
          <label className="w-100 h-100">
            <input type="file" accept="image/*" onChange={handleBackgroundChange} className="d-none" />
            <div className="w-100 h-100 rounded" style={{ 
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }} />
          </label>
          
          {/* Profile Avatar */}
          <label className="position-absolute" style={{ bottom: "-60px", left: "24px" }}>
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="d-none" />
            <Avatar
              src={avatar}
              sx={{
                width: 120,
                height: 120,
                border: "3px solid white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                cursor: "pointer"
              }}
            />
          </label>
        </div>

        {/* Profile Info Section */}
        <div className="row mt-5 px-3">
          <div className="col-12">
            <div className="d-flex align-items-center gap-2 mb-1">
              <Typography variant="h4" className="fw-bold">{username}</Typography>
              {isVerified ? <VerifiedIcon color="primary" /> : 
                <Button variant="outlined" size="small" className="ms-2">
                  Get verified
                </Button>
              }
            </div>
            <Typography variant="body2" color="text.secondary">
              Joined January 2025
            </Typography>
          </div>
        </div>

        {/* Social Links */}
        <div className="d-flex gap-2 mt-3 px-3">
          <IconButton size="small">
            <FacebookIcon />
          </IconButton>
          <IconButton size="small">
            <TwitterIcon />
          </IconButton>
          <IconButton size="small">
            <IosShareIcon />
          </IconButton>
          <IconButton size="small" onClick={handleDialogOpen}>
            <MoreHorizIcon />
          </IconButton>
        </div>

        {/* Tabs Section */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 4 }}>
          <Tabs 
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            {["Collected", "Offers made", "Deals", "Created", "Favorited", "Activity", "More"].map((tab) => (
              <Tab 
                key={tab} 
                label={tab} 
                value={tab}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: activeTab === tab ? 600 : 400
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Search and Filter Section */}
        <div className="d-flex align-items-center gap-3 mt-4">
          <div className="d-flex align-items-center flex-grow-1">
            <IconButton size="small">
              <FilterAltIcon />
            </IconButton>
            <TextField
              size="small"
              placeholder="Search by name"
              variant="outlined"
              fullWidth
              sx={{ maxWidth: 400 }}
            />
          </div>
          <div className="d-flex gap-2">
            <IconButton size="small">
              <SwapVertIcon />
            </IconButton>
            <IconButton size="small">
              <ViewModuleIcon />
            </IconButton>
          </div>
        </div>

        {/* No Items Section */}
        <div className="mt-4 text-center py-5 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
          <Typography variant="h6" className="mb-3">No items found for this search</Typography>
          <Button variant="contained" sx={{ textTransform: 'none' }}>
            Back to all items
          </Button>
        </div>
      </div>

      {/* Username Change Dialog */}
      <Dialog open={isDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Change Username</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Username"
            fullWidth
            variant="outlined"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSaveUsername} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      
      <Footer />
    </div>
    </>
  );
}
