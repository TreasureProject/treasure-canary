import * as React from "react";
import Toggle from "./Toggle";

const Footer = () => {
  return (
    <footer aria-labelledby="footer-heading" className="footer">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-10 flex items-center justify-end">
          <Toggle />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
