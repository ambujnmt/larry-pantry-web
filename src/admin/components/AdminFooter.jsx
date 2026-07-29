const AdminFooter = () => {
  return (
    <footer className="app-footer">
      <div className="container text-center py-3">

        <small className="copyright">
          © {new Date().getFullYear()} Restaurant Pantry LA. All rights reserved. Designed & Developed By{" "}
          <a className="app-link" href="https://www.nmttechnologies.com/" target="_blank" rel="noopener noreferrer">NMT Technologies</a>
        </small>

      </div>
    </footer>
  );
};

export default AdminFooter;