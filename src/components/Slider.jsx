import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useState, useEffect } from "react";
import Spinner from "./Spinner";
import { db } from "../firebase";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { EffectFade, Autoplay, Navigation, Pagination } from "swiper";
import "swiper/css/bundle";
import { useNavigate } from "react-router-dom";

SwiperCore.use([Autoplay, Navigation, Pagination]);

export default function Slider() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchListings() {
      const listingsRef = collection(db, "listings");
      const q = query(listingsRef, orderBy("timestamp", "desc"), limit(5));
      const querySnap = await getDocs(q);
      const list = [];
      querySnap.forEach((doc) =>
        list.push({ id: doc.id, data: doc.data() })
      );
      setListings(list);
      setLoading(false);
    }
    fetchListings();
  }, []);

  if (loading) return <Spinner />;
  if (!listings?.length) return null;

  return (
    <div className="relative rounded-b-2xl overflow-hidden shadow-card-hover">
      <Swiper
        slidesPerView={1}
        navigation
        pagination={{ type: "progressbar" }}
        effect="fade"
        modules={[EffectFade]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        className="!h-[280px] sm:!h-[340px] md:!h-[400px]"
      >
        {listings.map(({ data, id }) => (
          <SwiperSlide
            key={id}
            onClick={() => navigate(`/category/${data.type}/${id}`)}
            className="!cursor-pointer"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${data.imgUrls?.[0]})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg">
                {data.name}
              </h2>
              <p className="text-white/90 text-sm sm:text-base mb-3">
                Rs {data.discountedPrice ?? data.regularPrice}
                {data.type === "rent" && " / month"}
              </p>
              <span className="inline-block px-3 py-1 rounded-lg bg-primary-500/90 text-sm font-medium">
                View details →
              </span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
