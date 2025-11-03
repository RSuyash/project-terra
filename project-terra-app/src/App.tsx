import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import ErrorBoundary from './components/error/ErrorBoundary';
import VegetationPlotForm from './components/plots/VegetationPlotForm';
import { PlotList } from './components/plots/PlotList';
import BiodiversityAnalysis from './components/analysis/BiodiversityAnalysis';
import SpeciesAreaCurve from './components/analysis/SpeciesAreaCurve';
import CSVExport from './components/analysis/CSVExport';
import CanopyAnalysis from './components/CanopyAnalysisModule/CanopyAnalysis';
import Projects from './components/projects/Projects';
import ProjectDetail from './components/projects/ProjectDetail';
import Dashboard from './components/dashboard/Dashboard';
import ProjectDashboard from './components/projects/ProjectDashboard';
import Navigation from './components/layout/Navigation';

interface CardProps {
  title: string;
  description: string;
  link: string;
  linkText: string;
  icon: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, description, link, linkText, icon }) => (
    <div className="card transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-6 flex-grow">
            <div className="flex items-center mb-4">
                <div className="bg-primary-100 dark:bg-primary-900/50 p-3 rounded-full mr-4 flex-shrink-0">
                    {icon}
                </div>
                <h2 className="text-2xl font-bold text-primary-700 dark:text-primary-300">{title}</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{description}</p>
        </div>
        <div className="px-6 pb-6">
            <Link 
                to={link} 
                className="btn-primary w-full flex items-center justify-center py-3 px-4 text-center font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
            >
                {linkText}
            </Link>
        </div>
    </div>
);

const VegetationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>;
const PlotsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const BiodiversityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19M4.879 4.879L9.879 9.879M12 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" /></svg>;
const SpeciesAreaIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const ExportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const ProjectIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;


function App() {
  return (
    <AppProvider>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="container mx-auto px-4 py-12">
            <header className="text-center mb-8">
                <div className="flex justify-between items-center mb-6">
                    <Link to="/" className="text-3xl font-extrabold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200">
                        Project Terra 🌱
                    </Link>
                </div>
                <Navigation />
            </header>
            
            <main>
                <Routes>
                    <Route path="/" element={
                      <>
                        <div className="text-center mb-12">
                            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">Project Terra</h1>
                            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 font-light max-w-3xl mx-auto">Your all-in-one environmental science field data toolkit.</p>
                        </div>
                        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card title="Dashboard" description="Overview of your ecological fieldwork data and metrics." link="/dashboard" linkText="View Dashboard" icon={<DashboardIcon />} />
                            <Card title="Research Projects" description="Group related plots and manage them together." link="/projects" linkText="Manage Projects" icon={<ProjectIcon />} />
                            <Card title="Vegetation Plotting" description="Create and manage vegetation survey plots with species, measurements, and GPS data." link="/vegetation-plot" linkText="Start New Plot" icon={<VegetationIcon />} />
                            <Card title="Plot Management" description="Create, view, edit, and analyze your vegetation plots." link="/plots" linkText="Manage Plots" icon={<PlotsIcon />} />
                            <Card title="Biodiversity Analysis" description="Calculate diversity indices: Shannon-Wiener, Simpson, Richness, and more." link="/biodiversity" linkText="Analyze Data" icon={<BiodiversityIcon />} />
                            <Card title="Species-Area Curve" description="Generate and visualize species-area relationships from nested plots." link="/species-area" linkText="Create Curve" icon={<SpeciesAreaIcon />} />
                            <Card title="CSV Export" description="Export your data to CSV for analysis in spreadsheets or other tools." link="/export" linkText="Export Data" icon={<ExportIcon />} />
                        </div>
                      </>
                    } />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/project-dashboard" element={<ProjectDashboard />} />
                    <Route path="/vegetation-plot" element={<VegetationPlotForm />} />
                    <Route path="/plots" element={<PlotList />} />
                    <Route path="/plot/:id/edit" element={<VegetationPlotForm />} />
                    <Route path="/biodiversity" element={<BiodiversityAnalysis />} />
                    <Route path="/species-area" element={<SpeciesAreaCurve />} />
                    <Route path="/export" element={<CSVExport />} />
                    <Route path="/canopy" element={<CanopyAnalysis />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/project/:id" element={<ProjectDetail />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>

            <footer className="mt-20 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>&copy; {new Date().getFullYear()} Project Terra. Built for the field, by the field.</p>
            </footer>
          </div>
        </div>
      </ErrorBoundary>
    </AppProvider>
  );
}

export default App;
