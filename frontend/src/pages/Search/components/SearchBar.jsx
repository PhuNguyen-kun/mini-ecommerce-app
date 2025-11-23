export default function SearchBar() {
  return (
    <section className="w-full px-[326px] py-6 border-t border-[#dddbdc]">
      <div className="flex items-start">
        {/* Search Input */}
        <div className="flex-1 bg-[#f5f4f4] rounded px-4 py-4">
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full bg-transparent text-xs leading-4 tracking-[0.2px] text-neutral-500 focus:outline-none placeholder:text-neutral-500"
          />
        </div>
        
        {/* Cancel Button */}
        <button className="px-4 py-4 text-xs leading-4 tracking-[0.2px] text-neutral-500 hover:text-neutral-800">
          Cancel
        </button>
      </div>
    </section>
  );
}
