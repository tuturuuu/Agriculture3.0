function Footer() {
  const footerLinks = {
    product: {
      title: "Product",
      items: [
        "Employee Database",
        "Payroll",
        "Absences",
        "Time Tracking",
        "Shift Planner",
        "Recruiting",
      ],
    },
    information: {
      title: "Information",
      items: ["FAQ", "Blog", "Support"],
    },
    company: {
      title: "Company",
      items: ["About Us", "Careers", "Contact Us", "LIR Media"],
    },
  };

  const legalLinks = ["Terms", "Privacy", "Cookies"];
  const socialLinks = [
    { platform: "Facebook", icon: "fa-facebook-f" },
    { platform: "Twitter", icon: "fa-twitter" },
    { platform: "Instagram", icon: "fa-instagram" },
    { platform: "YouTube", icon: "fa-youtube" },
  ];

  return (
    <footer className="w-100 py-5 bg-white border-top ">
      {/* Main footer content with padding for spacing */}
      <div style={{ width: "85%", margin: "0 auto" }}>
        <div className="row mb-4">
          {/* Links Sections */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div className="col-md-3" key={key}>
              <h6 className="fw-bold mb-3">{section.title}</h6>
              <ul className="list-unstyled">
                {section.items.map((item, index) => (
                  <li key={index} className="mb-2">
                    <a href="#" className="text-decoration-none text-dark">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Rocket Image */}
          <div className="col-md-3">
            <img
              src="src\assets\png\Fast Food.png"
              alt="Food image"
              className="img-fluid"
              style={{ maxWidth: "200px" }}
            />
          </div>
        </div>

        {/* Bottom Section with border */}
        <div className="row pt-4 ">
          <div className="col-md-6">
            <p className="mb-0">© 2023 All Rights Reserved</p>
          </div>

          {/* Legal Links */}
          <div className="col-md-3">
            <ul className="list-inline mb-0">
              {legalLinks.map((link, index) => (
                <li className="list-inline-item me-3" key={index}>
                  <a href="#" className="text-decoration-none text-dark">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media Icons */}
          <div className="col-md-3">
            <ul className="list-inline mb-0 text-end">
              {socialLinks.map((social, index) => (
                <li className="list-inline-item" key={index}>
                  <a href="#" className="text-dark mx-2">
                    <i className={`fab ${social.icon}`}></i>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
