// src/customer/components/Breadcrumb.jsx

function Breadcrumb({ pageTitle }) {
  return (
    <section className="breadcrumb-section">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="breadcrumb-content">
              <h1 className="page-title">{pageTitle}</h1>
              <ul className="breadcrumb-page-list">
                <li className="breadcrumb-item"><a href="/">Home</a></li>
                <li className="breadcrumb-item">{pageTitle}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default Breadcrumb;