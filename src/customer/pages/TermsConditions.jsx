// src/customer/pages/TermsConditions.jsx
import { useState, useEffect } from "react";
import Breadcrumb from "../components/Breadcrumb";
import { getWebsitePage } from "../../utils/websiteApi";

function TermsConditions() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWebsitePage("terms-conditions")
      .then((res) => setPage(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <Breadcrumb pageTitle="Terms & Conditions" />

      <section className="section-space-ptb-90">
        <div className="container">
          {loading ? (
            <p className="text-muted">Loading...</p>
          ) : (
            <>
              <div className="section-title-two">
                <h2 className="section-title">
                  {page?.title || ""}
                </h2>
              </div>

              <div
                dangerouslySetInnerHTML={{
                  __html: page?.content || "",
                }}
              />
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default TermsConditions;