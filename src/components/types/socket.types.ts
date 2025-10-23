
export interface ClientToServerEvents {
  search: (payload: { query: string }) => void;
}

export interface ServerToClientEvents {
  searchResults: (data: Array<{ id: string; name: string }>) => void;
}
