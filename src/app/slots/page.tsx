// "use client";
// import AppHeader from "@/components/AppHeader";
// import React, { useEffect, useRef, useState } from "react";

// import { GameCardWithProvider } from "@/components/GameCards";
// import { useGames } from "@/lib/store.zustond";
// import { Categories, Title } from "@/types/game";
// import PrimaryInput from "@/components/form/input";
// import GameLoader from "@/components/loader/GameLoader";

// import "swiper/css";
// import "swiper/css/navigation";
// import FilterProivder from "./filter-proivder";
// import Link from "next/link";
// import { MdFavorite } from "react-icons/md";
// import { ClipLoader } from "react-spinners";
// import SideNavLayout from "@/components/SideNavLayout";

// const SlotPage = () => {
//   const loaderRef = useRef<HTMLDivElement | null>(null);

//   const [search, setSearch] = useState<string>();
//   const [provider, setProvider] = useState<Title>();
//   const [limit, setLimit] = useState(30);

//   const { getGames } = useGames((state) => state);
//   const gamesList = getGames(Categories.Slots, search, limit, provider);

//   const hasIntersectedOnce = useRef(false);
//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         const entry = entries[0];

//         if (entry.isIntersecting && !hasIntersectedOnce.current) {
//           console.log("Loader is on screen, fetch data now!");
//           setLimit((limit) => limit + 9);
//           hasIntersectedOnce.current = true;
//         }

//         // Reset the flag when the loader goes out of view
//         if (!entry.isIntersecting) {
//           hasIntersectedOnce.current = false;
//         }
//       },
//       {
//         root: null,
//         rootMargin: "0px",
//         threshold: 0.1,
//       }
//     );

//     if (loaderRef.current) {
//       observer.observe(loaderRef.current);
//     }

//     return () => {
//       if (loaderRef.current) {
//         observer.unobserve(loaderRef.current);
//       }
//     };
//   }, []);
//   return (
//     <SideNavLayout>
//       <div>
//         <AppHeader title="Slots" />
//         <main className="py-5 px-2 bg-[#003e3e]">
//           <FilterProivder onSelect={(provider) => setProvider(provider)} />
//           <div className="flex items-center gap-2">
//             <PrimaryInput
//               placeholder="Search Games"
//               className="mb-2"
//               onChange={(e) => setSearch(e.target.value)}
//               value={search}
//             />
//             <Link
//               href="/favorits"
//               title="favorits"
//               className="bg-wwwwwwck-44-4comdaintree -mt-2 rounded-[10.4px] overflow-hidden border border-solid border-[#006165] shadow-[0px_2.08px_0px_#002631] p-3"
//             >
//               <MdFavorite className="w-5 h-5 text-[#23ffc8]" />
//             </Link>
//           </div>
//           <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 lg:gap-4 mt-2">
//             {gamesList &&
//               gamesList.map((game, i) => (
//                 <GameCardWithProvider game={game} key={i} />
//               ))}

//             <GameLoader lenght={15} loading={!!!gamesList} />
//           </div>

//           <div
//             ref={loaderRef}
//             className="my-5 flex items-center justify-center"
//           >
//             {gamesList && gamesList.length > 29 && (
//               <ClipLoader color="#FFB800" size={25} />
//             )}
//           </div>
//         </main>
//       </div>
//     </SideNavLayout>
//   );
// };

// export default SlotPage;

"use client";
import AppHeader from "@/components/AppHeader";
import React, { useEffect, useRef, useState } from "react";

import { GameCardWithProvider } from "@/components/GameCards";
import { useGames } from "@/lib/store.zustond";
import { Categories, Title } from "@/types/game";
import PrimaryInput from "@/components/form/input";
import GameLoader from "@/components/loader/GameLoader";

import "swiper/css";
import "swiper/css/navigation";
import FilterProivder from "./filter-proivder";
import Link from "next/link";
import { MdFavorite } from "react-icons/md";
import { ClipLoader } from "react-spinners";
import SideNavLayout from "@/components/SideNavLayout";
import { useFetchGamesByProviderMutation } from "@/lib/features/gamesApiSlice";
import TabLayout from "@/components/TabLayout";

const SlotPage = () => {
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const [search, setSearch] = useState<string>();
  const [provider, setProvider] = useState<Title>();
  const [limit, setLimit] = useState(30);
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  const { getGames, setProviderGames, setProviderLoading } = useGames((state) => state);
  const [fetchGamesByProvider] = useFetchGamesByProviderMutation();
  
  const gamesList = getGames(Categories.Slots, search, limit, provider);

  const hasIntersectedOnce = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting && !hasIntersectedOnce.current) {
          setLimit((limit) => limit + 9);
          hasIntersectedOnce.current = true;
        }

        // Reset the flag when the loader goes out of view
        if (!entry.isIntersecting) {
          hasIntersectedOnce.current = false;
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, []);

  const handleProviderChange = async (provider: Title | "all") => {
    setIsFilterLoading(true);
    setProvider(provider as Title);
    
    // If "all" is selected, we don't need to fetch provider-specific games
    if (provider === "all") {
      setIsFilterLoading(false);
      return;
    }
  
    const providerToSoftApiBrandId: Record<string, string> = {
      "jili_gaming": "49",
      "pgsoft_slot": "45",
      "evolution": "58",
      "spribe": "67",
      "tada_gaming": "51",
      "pragmatic_live_asia": "54",
      "cq9_slot": "52",
      "bng": "65",
      "hacksaw": "70",
      "habanero": "69",
      "smartsoft": "71",
    };

    const softApiBrandId = providerToSoftApiBrandId[provider];

    if (softApiBrandId) {
      try {
        setProviderLoading(true);
        console.log(`Fetching provider ${provider} from SoftAPI brand_id: ${softApiBrandId}`);
        const res = await fetch(`/api/softapi/games?brand_id=${softApiBrandId}`);
        if (!res.ok) throw new Error("SoftAPI response not OK");
        const response = await res.json();
        
        if (response.success) {
          // Store provider-specific games in the store
          setProviderGames(provider, response.games);
        }
      } catch (error) {
        console.error("Error fetching games by provider from SoftAPI:", error);
      } finally {
        setProviderLoading(false);
        setIsFilterLoading(false);
      }
      return;
    }

    // For non-SoftAPI providers, do not call GameXA API.
    // Set provider games to empty so that it clears selection loading safely.
    setProviderGames(provider, []);
    setProviderLoading(false);
    setIsFilterLoading(false);
  };

  return (
    <SideNavLayout>
      <TabLayout>
        <div>
          <AppHeader title="Slots" />
          <main className="py-5 px-2 bg-[#003e3e] pb-24 md:pb-5">
            <FilterProivder onSelect={handleProviderChange} />
            <div className="flex items-center gap-2">
              <PrimaryInput
                placeholder="Search Games"
                className="mb-2"
                onChange={(e) => setSearch(e.target.value)}
                value={search}
              />
              <Link
                href="/favorites"
                title="favorites"
                className="bg-wwwwwwck-44-4comdaintree -mt-2 rounded-[10.4px] overflow-hidden border border-solid border-[#006165] shadow-[0px_2.08px_0px_#002631] p-3"
              >
                <MdFavorite className="w-5 h-5 text-[#23ffc8]" />
              </Link>
            </div>

            {isFilterLoading ? (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 lg:gap-4 mt-2">
                <GameLoader length={15} loading={true} />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 lg:gap-4 mt-2">
                  {gamesList &&
                    gamesList.map((game, i) => (
                      <GameCardWithProvider game={game} key={i} />
                    ))}

                  {!gamesList && <GameLoader length={15} loading={true} />}
                </div>

                <div
                  ref={loaderRef}
                  className="my-5 flex items-center justify-center"
                >
                  {gamesList && gamesList.length > 29 && (
                    <ClipLoader color="#FFB800" size={25} />
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </TabLayout>
    </SideNavLayout>
  );
};

export default SlotPage;
