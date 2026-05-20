import { NextRequest, NextResponse } from "next/server";

type GameInfo = {
  id: string;
  name: string;
  img: string;
  device: string;
  title: string;
  categories: string;
  bm: string;
  demo: string;
  rewriterule: string;
  exitButton: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { game_type, search } = body;

    const mockGamesList = {
      slots: [
        {
          id: "slot1",
          name: "Fortune Gems",
          img: "/games/JL-fortune-gems.png",
          device: "mobile,desktop",
          title: "JL",
          categories: "slots",
          bm: "0",
          demo: "1",
          rewriterule: "0",
          exitButton: "1"
        },
        {
          id: "slot2",
          name: "Money Coming",
          img: "/games/JL-money-coming.png",
          device: "mobile,desktop",
          title: "JL",
          categories: "slots",
          bm: "0",
          demo: "1",
          rewriterule: "0",
          exitButton: "1"
        }
      ],
      live_dealers: [
        {
          id: "live1",
          name: "Crazy Time",
          img: "/games/crazy-time.png",
          device: "mobile,desktop",
          title: "EVO",
          categories: "live_dealers",
          bm: "0",
          demo: "0",
          rewriterule: "0",
          exitButton: "1"
        }
      ],
      sport: [
        {
          id: "sport1",
          name: "Boxing King",
          img: "/games/JL-boxing-king.png",
          device: "mobile,desktop",
          title: "JL",
          categories: "sport",
          bm: "0",
          demo: "1",
          rewriterule: "0",
          exitButton: "1"
        }
      ],
      fishing: [
        {
          id: "fish1",
          name: "Fish Hunter",
          img: "/games/fish-hunter.png",
          device: "mobile,desktop",
          title: "JL",
          categories: "fishing",
          bm: "0",
          demo: "1",
          rewriterule: "0",
          exitButton: "1"
        },
        {
          id: "fish2",
          name: "Deep Sea Treasure",
          img: "/games/deep-sea-treasure.png",
          device: "mobile,desktop",
          title: "PG",
          categories: "fishing",
          bm: "0",
          demo: "1",
          rewriterule: "0",
          exitButton: "1"
        }
      ],
      video_poker: [
        {
          id: "poker1",
          name: "Jacks or Better",
          img: "/games/super-ace.png",
          device: "mobile,desktop",
          title: "NetEnt",
          categories: "video_poker",
          bm: "0",
          demo: "1",
          rewriterule: "0",
          exitButton: "1"
        },
        {
          id: "poker2",
          name: "Deuces Wild",
          img: "/games/super-ace.png",
          device: "mobile,desktop",
          title: "Microgaming",
          categories: "video_poker",
          bm: "0",
          demo: "1",
          rewriterule: "0",
          exitButton: "1"
        }
      ]
    };

    const normalizedSearch = typeof search === "string" ? search.trim().toLowerCase() : null;
    const filteredMockGamesList = normalizedSearch
      ? (Object.fromEntries(
          Object.entries(mockGamesList).map(([category, games]) => [
            category,
            (games as GameInfo[]).filter((game) => game.name.toLowerCase().includes(normalizedSearch))
          ])
        ) as typeof mockGamesList)
      : mockGamesList;

    let gamesList;
    if (game_type === "all" || !game_type) {
      gamesList = filteredMockGamesList;
    } else if (filteredMockGamesList[game_type as keyof typeof filteredMockGamesList]) {
      gamesList = { [game_type]: filteredMockGamesList[game_type as keyof typeof filteredMockGamesList] };
    } else {
      gamesList = {};
    }

    return NextResponse.json({
      success: true,
      gamesList
    });
  } catch (error) {
    console.error("Error fetching mock games list:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch games list",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
