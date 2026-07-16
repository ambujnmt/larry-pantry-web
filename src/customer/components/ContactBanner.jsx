import { useState, useEffect } from "react"
import { getWebsiteBottomBanners } from "../../utils/websiteApi"

const DEFAULT_BANNER_1 = "/assets/img/img2.avif"
const DEFAULT_BANNER_2 = "/assets/img/img3.avif"

function ContactBanner() {
  const [banner1, setBanner1] = useState(null)
  const [banner2, setBanner2] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getWebsiteBottomBanners()
      .then(res => {
        setBanner1(res.data?.bottom_banner_1_url || DEFAULT_BANNER_1)
        setBanner2(res.data?.bottom_banner_2_url || DEFAULT_BANNER_2)
      })
      .catch(() => {
        setBanner1(DEFAULT_BANNER_1)
        setBanner2(DEFAULT_BANNER_2)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="banner-section">
      <div className="container-fluid px-0">
        <div className="row gx-0">
          <div className="col-md-6">
            <div className="inner-image">
              {loading ? (
                <div className="banner-skeleton" />
              ) : (
                <img
                  src={banner1}
                  alt="banner"
                  className="banner-fade-in"
                  onError={e => { e.target.onerror = null; e.target.src = DEFAULT_BANNER_1 }}
                />
              )}
            </div>
          </div>
          <div className="col-md-6">
            <div className="inner-image">
              {loading ? (
                <div className="banner-skeleton" />
              ) : (
                <img
                  src={banner2}
                  alt="banner"
                  className="banner-fade-in"
                  onError={e => { e.target.onerror = null; e.target.src = DEFAULT_BANNER_2 }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactBanner