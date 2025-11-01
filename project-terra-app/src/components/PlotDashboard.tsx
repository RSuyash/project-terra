import { useState } from 'react';
import SidePanel from '../SidePanel';
import Ribbon from '../Ribbon';
import PlotList from './PlotManagement/PlotList';
import PlotForm from './PlotForm/PlotForm';
import PlotVisualization from './PlotVisualization/PlotVisualization';
import type { VegetationPlot } from '../db/database';

const PlotDashboard = () => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [view, setView] = useState<'list' | 'form' | 'visualization'>('list');
  const [selectedPlot, setSelectedPlot] = useState<VegetationPlot | null>(null);
  const [editingPlot, setEditingPlot] = useState<VegetationPlot | number | null>(null);

  const toggleSidePanel = () => {
    setIsSidePanelOpen(!isSidePanelOpen);
  };

  const handleCreatePlot = () => {
    setEditingPlot(null);
    setView('form');
  };

  const handleEditPlot = (plot: VegetationPlot) => {
    setEditingPlot(plot);
    setView('form');
  };

  const handleViewPlot = (plot: VegetationPlot) => {
    setSelectedPlot(plot);
    setView('visualization');
  };

  const handlePlotSave = () => {
    setView('list');
    setEditingPlot(null);
  };

  const handleVisualizationBack = () => {
    setView('list');
    setSelectedPlot(null);
  };

  const handleCancelForm = () => {
    setView('list');
    setEditingPlot(null);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <SidePanel isOpen={isSidePanelOpen} togglePanel={toggleSidePanel}>
        <nav>
          <ul className="space-y-2">
            <li>
              <button 
                className={`block w-full text-left py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white ${
                  view === 'list' ? 'bg-blue-100 dark:bg-blue-900/50 font-medium' : ''
                }`}
                onClick={() => setView('list')}
              >
                Plot Overview
              </button>
            </li>
            <li>
              <button 
                className={`block w-full text-left py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white ${
                  view === 'form' && !editingPlot ? 'bg-blue-100 dark:bg-blue-900/50 font-medium' : ''
                }`}
                onClick={handleCreatePlot}
              >
                Create New Plot
              </button>
            </li>
            <li>
              <a href="#" className="block py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white">
                Data Analysis
              </a>
            </li>
            <li>
              <a href="#" className="block py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white">
                Species Tracking
              </a>
            </li>
            <li>
              <a href="#" className="block py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white">
                Reports
              </a>
            </li>
          </ul>
        </nav>
      </SidePanel>

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          <Ribbon title="Plot Tools">
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              onClick={handleCreatePlot}
            >
              New Plot
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
              Import Data
            </button>
            <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors">
              Export Report
            </button>
            <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors">
              Analysis
            </button>
            <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
              Settings
            </button>
          </Ribbon>

          <div className="mt-6">
            {view === 'list' && (
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Plot Dashboard</h1>
                <PlotList 
                  onPlotSelect={handleViewPlot} 
                  onPlotEdit={handleEditPlot}
                  selectedPlotId={selectedPlot?.id} 
                />
              </div>
            )}

            {view === 'form' && (
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  {editingPlot ? 'Edit Plot' : 'Create New Plot'}
                </h1>
                <PlotForm 
                  plot={editingPlot as VegetationPlot} 
                  onSave={handlePlotSave} 
                  onCancel={handleCancelForm} 
                />
              </div>
            )}

            {view === 'visualization' && selectedPlot && (
              <div>
                <div className="mb-4">
                  <button
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={handleVisualizationBack}
                  >
                    &larr; Back to Plots
                  </button>
                </div>
                <PlotVisualization plot={selectedPlot} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PlotDashboard;