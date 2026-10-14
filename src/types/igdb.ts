// Shapes of the IGDB data this app requests. IGDB only returns the fields we
// ask for, so everything except id and name is optional.

export type IgdbPlatform = {
  id?: number | string;
  name?: string;
  abbreviation?: string;
};

export type IgdbGenre = {
  id?: number | string;
  name?: string;
};

export type IgdbGame = {
  id: number;
  name: string;
  slug?: string;
  summary?: string;
  cover?: {
    url?: string;
  };
  first_release_date?: number;
  total_rating?: number;
  total_rating_count?: number;
  platforms?: IgdbPlatform[];
  genres?: IgdbGenre[];
};

// What /api/games/search returns: IGDB data plus whether the signed-in user
// already has the game in their library.
export type DiscoverGame = IgdbGame & {
  isInLibrary: boolean;
  libraryStatus: string | null;
  gameLogId?: string | null;
};
