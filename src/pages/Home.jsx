
import {
  collection,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import ListingItem from "../components/ListingItem";
import Slider from "../components/Slider";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";

export default function Home() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
  } else {
  }
  // Offers
   const [searchQuery, setSearchQuery] = useState("");
 const [offerListings, setOfferListings] = useState(null);

useEffect(() => {
  async function fetchListings() {
    try {
      // get reference
      const listingsRef = collection(db, "listings");
      // create the query
      const q = query(
        listingsRef,
        where("offer", "==", true),
        orderBy("timestamp", "desc"),
        limit(4)
      );
      // execute the query
      const querySnap = await getDocs(q);
      const listings = [];
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      // filter the listings array
      const filteredListings = listings.filter((listing) =>
        listing.data.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setOfferListings(filteredListings);
    } catch (error) {
      console.log(error);
    }
  }
  fetchListings();
}, [searchQuery]);

  // Places for rent
  const [rentListings, setRentListings] = useState(null);
  useEffect(() => {
    async function fetchListings() {
      try {
        // get reference
        const listingsRef = collection(db, "listings");
        // create the query
        const q = query(
          listingsRef,
          where("type", "==", "rent"),
          orderBy("timestamp", "desc"),
          limit(4)
        );
        // execute the query
        const querySnap = await getDocs(q);
        const listings = [];
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
         // filter the listings array
      const filteredListings = listings.filter((listing) =>
      listing.data.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
        setRentListings(filteredListings);
      } catch (error) {
        console.log(error);
      }
    }
    fetchListings();
  }, [searchQuery]);
  // Places for sale
  const [saleListings, setSaleListings] = useState(null);
  useEffect(() => {
    async function fetchListings() {
      try {
        // get reference
        const listingsRef = collection(db, "listings");
        // create the query
        const q = query(
          listingsRef,
          where("type", "==", "sale"),
          orderBy("timestamp", "desc"),
          limit(4)
        );
        // execute the query
        const querySnap = await getDocs(q);
        const listings = [];
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
           // filter the listings array
      const filteredListings = listings.filter((listing) =>
      listing.data.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
        setSaleListings(filteredListings);
      } catch (error) {
        console.log(error);
      }
    }
    fetchListings();
  }, [searchQuery]);
  return (
    <div>
      <Slider />
      {user ? (
        <>
         <div style={{ display: "flex", justifyContent: "flex-end" }} className="mr-4 mt-3">
      <select
        onChange={(e) => setSearchQuery(e.target.value)}
        value={searchQuery}
>
  <option value="">Select</option>
  <option value="Lahore">Lahore</option>
  <option value="Bahawalpur">Bahawalpur</option>
  <option value="Hasilpur">Hasilpur</option>
  <option value="Islamabad">Islamabad</option>
  <option value="Bahawalnagar">Bahawalnagar</option>
  <option value="Khair Pur">Khair Pur</option>
  <option value="Multan">Multan</option>
  <option value="	Faisalabad">	Faisalabad</option>
  <option value="	Rahim Yar Khan">	Rahim Yar Khan</option>
  <option value="	Chishtian">	Chishtian</option>
</select>
      <input
          type="text"
           placeholder="City Name"
            value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          />

      </div>
        </>
      ) : (
        <>
        
        </>
      )}
      <div className="max-w-6xl mx-auto pt-4 space-y-6">
        {offerListings && offerListings.length > 0 && (
          <div className="m-2 mb-6 text-center">
            <h2 className="px-3 text-2xl mt-6 mb-3 font-semibold">
              Recent offers
            </h2>
            <Link to="/offers">
              <a
                href="#_"
                class="relative rounded px-5 py-2 mx-3 bottom-1 overflow-hidden group bg-blue-500 relative hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-400 text-white hover:ring-2 hover:ring-offset-2 hover:ring-blue-400 transition-all ease-out duration-300"
              >
                <span class="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
                <span class="relative">Show more offers</span>
              </a>
            </Link>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
              {offerListings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                />
              ))}
            </ul>
          </div>
        )}
        {rentListings && rentListings.length > 0 && (
          <div className="m-2 mb-6  text-center">
            <h2 className="px-3 text-2xl mt-6 mb-3 font-semibold">
              Places for rent
            </h2>
            <Link to="/category/rent">
              <a
                href="#_"
                class="relative rounded px-5 py-2 mx-3 bottom-1 overflow-hidden group bg-blue-500 relative hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-400 text-white hover:ring-2 hover:ring-offset-2 hover:ring-blue-400 transition-all ease-out duration-300"
              >
                <span class="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
                <span class="relative">Show more places for rent</span>
              </a>
            </Link>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
              {rentListings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                />
              ))}
            </ul>
          </div>
        )}
        {saleListings && saleListings.length > 0 && (
          <div className="m-2 mb-6  text-center">
            <h2 className="px-3 text-2xl mt-6 mb-3 font-semibold">
              Places for sale
            </h2>
            <Link to="/category/sale">
              <a
                href="#_"
                class="relative rounded px-5 py-2 mx-3 bottom-1 overflow-hidden group bg-blue-500 relative hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-400 text-white hover:ring-2 hover:ring-offset-2 hover:ring-blue-400 transition-all ease-out duration-300"
              >
                <span class="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
                <span class="relative">Show more places for sale</span>
              </a>
            </Link>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
              {saleListings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
