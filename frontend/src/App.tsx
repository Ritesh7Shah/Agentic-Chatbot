import React, { useState } from 'react';
import { Bot, FileText, Mic, BarChart3, Calendar, Menu, X } from 'lucide-react';
import { SmartChat } from './components/SmartChat';
import { PDFChat } from './components/PDFChat';
import { VoiceAssistant } from './components/VoiceAssistant';
import { CSVQuery } from './components/CSVQuery';
import { CalendarEvent } from './components/CalendarEvent';

type Tab = 'chat' | 'pdf' | 'voice' | 'csv' | 'calendar';

const tabs = [
  { id: 'chat' as Tab, label: 'Smart Chat', icon: Bot },
  { id: 'pdf' as Tab, label: 'PDF Chat', icon: FileText },
  { id: 'voice' as Tab, label: 'Voice Assistant', icon: Mic },
  { id: 'csv' as Tab, label: 'CSV Analyzer', icon: BarChart3 },
  { id: 'calendar' as Tab, label: 'Calendar Events', icon: Calendar },
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <SmartChat />;
      case 'pdf':
        return <PDFChat />;
      case 'voice':
        return <VoiceAssistant />;
      case 'csv':
        return <CSVQuery />;
      case 'calendar':
        return <CalendarEvent />;
      default:
        return <SmartChat />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Bot className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">AI Assistant Hub</h1>
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`bg-white shadow-sm border-b border-gray-200 ${isMobileMenuOpen ? 'block' : 'hidden'} md:block`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:space-x-8 py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-2 md:mb-0 ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
          {renderContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>© 2025 AI Assistant Hub. Powered by advanced AI technologies.</p>
            <p className="text-sm mt-2">
              Connect to your FastAPI backend at <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:8000</code>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;