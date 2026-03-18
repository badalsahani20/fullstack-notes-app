import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * Global search bar in the top header.
 * Note: Currently this only contains local state and UI. Wiring it up
 * to global search logic would happen here without dirtying AppHeader.
 */
const HeaderSearch = () => {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="desktop-search-wrap">
      <Search size={16} className="desktop-search-icon" />
      <Input
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        placeholder="Search notes, folders, and ideas..."
        className="desktop-search-input"
      />
    </div>
  );
};

export default HeaderSearch;
