import { useState, useEffect } from 'react';
import { addSpecies, searchSpecies, getAllSpecies } from '../db/database';
import type { Species } from '../db/database';

export function SpeciesManager() {
  const [species, setSpecies] = useState<Species[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSpecies, setNewSpecies] = useState({
    name: '',
    scientificName: '',
    family: '',
    commonNames: '',
    notes: '',
  });
  
  useEffect(() => {
    loadSpecies();
  }, []);
  
  async function loadSpecies() {
    const allSpecies = await getAllSpecies();
    setSpecies(allSpecies);
  }
  
  async function handleSearch() {
    if (searchQuery.trim()) {
      const results = await searchSpecies(searchQuery);
      setSpecies(results);
    } else {
      loadSpecies();
    }
  }
  
  async function handleAddSpecies() {
    if (!newSpecies.name.trim()) {
      alert('Please enter a species name');
      return;
    }
    
    const commonNamesArray = newSpecies.commonNames
      .split(',')
      .map(name => name.trim())
      .filter(name => name);
    
    await addSpecies({
      name: newSpecies.name,
      scientificName: newSpecies.scientificName || undefined,
      family: newSpecies.family || undefined,
      commonNames: commonNamesArray.length > 0 ? commonNamesArray : undefined,
      notes: newSpecies.notes || undefined,
    });
    
    setNewSpecies({
      name: '',
      scientificName: '',
      family: '',
      commonNames: '',
      notes: '',
    });
    setShowAddForm(false);
    loadSpecies();
  }
  
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Species Database ({species.length})</h3>
        <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add Species'}
        </button>
      </div>
      
      {/* Search */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            className="input-field flex-1"
            placeholder="Search by name, scientific name, or common names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn-secondary" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>
      
      {/* Add Form */}
      {showAddForm && (
        <div className="border-2 border-primary-200 dark:border-primary-800 p-4 rounded-lg space-y-4 mb-4">
          <h4 className="font-bold text-primary-700 dark:text-primary-300">Add New Species</h4>
          
          <div>
            <label className="block text-sm font-medium mb-2">Species Name *</label>
            <input
              type="text"
              className="input-field"
              value={newSpecies.name}
              onChange={(e) => setNewSpecies({ ...newSpecies, name: e.target.value })}
              placeholder="e.g., Teak, Oak"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Scientific Name</label>
            <input
              type="text"
              className="input-field"
              value={newSpecies.scientificName}
              onChange={(e) => setNewSpecies({ ...newSpecies, scientificName: e.target.value })}
              placeholder="e.g., Tectona grandis"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Family</label>
            <input
              type="text"
              className="input-field"
              value={newSpecies.family}
              onChange={(e) => setNewSpecies({ ...newSpecies, family: e.target.value })}
              placeholder="e.g., Lamiaceae"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Common Names</label>
            <input
              type="text"
              className="input-field"
              value={newSpecies.commonNames}
              onChange={(e) => setNewSpecies({ ...newSpecies, commonNames: e.target.value })}
              placeholder="Comma-separated: e.g., Sag, Sagwan"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              className="input-field"
              rows={2}
              value={newSpecies.notes}
              onChange={(e) => setNewSpecies({ ...newSpecies, notes: e.target.value })}
              placeholder="Additional information..."
            />
          </div>
          
          <button className="btn-primary w-full" onClick={handleAddSpecies}>
            Add Species
          </button>
        </div>
      )}
      
      {/* Species List */}
      {species.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No species found. Add your first species!
        </p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {species.map((s) => (
            <div key={s.id} className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
              <div className="font-semibold">{s.name}</div>
              {s.scientificName && (
                <div className="text-sm text-gray-600 dark:text-gray-400 italic">
                  {s.scientificName}
                </div>
              )}
              {s.commonNames && s.commonNames.length > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Common: {s.commonNames.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

