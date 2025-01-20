import { Box, Typography, Container } from "@mui/material";
import NavigationBar from "./components/NavigationBar";
import Footer from "./components/Footer";

export default function About() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <NavigationBar />

      <Container
        maxWidth="md"
        sx={{
          py: 8,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {/* Introduction Section */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              mb: 4,
            }}
          >
            Introduction to Agriculture 3.0
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography
              variant="body1"
              sx={{ fontSize: "1.1rem", lineHeight: 1.7 }}
            >
              We are transforming agricultural trade through a{" "}
              <strong>decentralized platform</strong> powered by Web 3.0
              technologies. Our mission is to empower farmers, traders, and
              consumers with tools for{" "}
              <strong>transparency, trust, and efficiency</strong> in every
              transaction.
            </Typography>

            <Typography
              variant="body1"
              sx={{ fontSize: "1.1rem", lineHeight: 1.7 }}
            >
              With a focus on <strong>freshness tracking</strong>, we ensure the
              quality of agricultural products from harvest to sale. Using
              blockchain technology, we provide{" "}
              <strong>immutable transaction records</strong>, fostering trust
              between buyers and sellers. Our platform enables{" "}
              <strong>peer-to-peer trading</strong>, eliminating the need for
              intermediaries and reducing costs.
            </Typography>

            <Typography
              variant="body1"
              sx={{ fontSize: "1.1rem", lineHeight: 1.7 }}
            >
              We envision a sustainable and transparent agricultural ecosystem
              where innovation meets tradition, empowering everyone in the
              supply chain. Together, let&apos;s shape the future of
              agriculture!
            </Typography>
          </Box>
        </Box>

        {/* Team Section */}
        <Box sx={{ mt: 6 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              mb: 4,
            }}
          >
            Meet our Team
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
            <img
              src="src/assets/png/meetourteam.png"
              alt="Meet Our Team"
              style={{
                maxWidth: "100%",
                height: "auto",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
          </Box>

          <Typography
            variant="body1"
            sx={{
              fontSize: "1.1rem",
              lineHeight: 1.7,
              maxWidth: "800px",
              margin: "0 auto",
              textAlign: "left",
            }}
          >
            We are a team of dedicated students from Swinburne University,
            passionate about leveraging cutting-edge technology to address
            real-world challenges. As part of our project, we have developed a
            decentralized Web3 platform built on Ethereum, utilizing Solidity
            for smart contract implementation. Our platform focuses on
            revolutionizing the agriculture sector by fostering transparency,
            efficiency, and trust in transactions.
          </Typography>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}
