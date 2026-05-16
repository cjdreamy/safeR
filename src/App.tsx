import { useState, useEffect } from "react";
import { 
  Bell, 
  Map as MapIcon, 
  Shield, 
  AlertTriangle, 
  Navigation2, 
  Search, 
  Info, 
  Activity, 
  Users, 
  ChevronRight,
  Plus,
  Radio,
  Menu,
  X,
  HeartPulse,
  CloudLightning,
  Flame,
  Waves,
  AlertOctagon,
  MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SafeMap } from "./components/map/SafeMap";
import { MOCK_HAZARDS, MOCK_SHELTERS, HAZARD_TYPES, HazardZone, Shelter } from "./data/mockData";
import { Button } from "./components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Badge } from "./components/ui/badge";
import { toast, Toaster } from "sonner";
import { ScrollArea } from "./components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Label } from "./components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Textarea } from "./components/ui/textarea";

export default function SafeRouteApp() {
  const [activeTab, setActiveTab] = useState("map");
  const [hazards, setHazards] = useState<HazardZone[]>(MOCK_HAZARDS);
  const [shelters, setShelters] = useState<Shelter[]>(MOCK_SHELTERS);
  const [routingMode, setRoutingMode] = useState(false);
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null);
  const [endPoint, setEndPoint] = useState<[number, number] | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // New report form state - Centered on Nairobi
  const [newReport, setNewReport] = useState<{
    type: keyof typeof HAZARD_TYPES;
    severity: HazardZone['severity'];
    description: string;
    location: [number, number];
  }>({
    type: 'FLOOD',
    severity: 'medium',
    description: '',
    location: [-1.2921, 36.8219]
  });

  const handleMapClick = (latlng: [number, number]) => {
    if (routingMode) {
      if (!startPoint) {
        setStartPoint(latlng);
        toast.info("Start point set. Now select destination.");
      } else if (!endPoint) {
        setEndPoint(latlng);
        toast.success("Destination set. Safe route calculated.");
      } else {
        setStartPoint(latlng);
        setEndPoint(null);
        toast.info("Start point reset.");
      }
    }
  };

  const submitReport = () => {
    const hazard: HazardZone = {
      id: Math.random().toString(36).substr(2, 9),
      ...newReport,
      radius: newReport.severity === 'critical' ? 1500 : 800,
      center: newReport.location,
      timestamp: new Date().toISOString()
    };
    setHazards([hazard, ...hazards]);
    toast.success("Emergency report submitted. Local grid updated.");
    setNewReport({
      type: 'FLOOD',
      severity: 'medium',
      description: '',
      location: [-1.2921, 36.8219]
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white border-red-700';
      case 'high': return 'bg-orange-500 text-white border-orange-600';
      case 'medium': return 'bg-yellow-500 text-white border-yellow-600';
      default: return 'bg-blue-500 text-white border-blue-600';
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Sidebar Navigation */}
      <aside className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-50 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 flex items-center gap-3 border-b">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Shield size={24} />
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="font-bold text-lg tracking-tight">SafeRoute</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">AI Emergency Nav</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <NavItem icon={MapIcon} label="Interactive Map" active={activeTab === 'map'} onClick={() => setActiveTab('map')} isOpen={isSidebarOpen} />
          <NavItem icon={Shield} label="Shelter Finder" active={activeTab === 'shelters'} onClick={() => setActiveTab('shelters')} isOpen={isSidebarOpen} />
          <NavItem icon={Bell} label="Active Alerts" active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} isOpen={isSidebarOpen} count={hazards.length} />
          <NavItem icon={Activity} label="Risk Analysis" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} isOpen={isSidebarOpen} />
        </nav>

        <div className="p-4 border-t space-y-2">
          {isSidebarOpen && (
            <div className="bg-slate-900 text-white p-3 rounded-lg text-xs mb-2">
              <div className="flex items-center gap-2 mb-1">
                <Radio className="text-red-400 animate-pulse" size={14} />
                <span className="font-bold uppercase tracking-wide">Live Status</span>
              </div>
              <p className="text-slate-400">Regional Emergency System: ACTIVE</p>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-slate-500"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={18} className="mr-2" /> : <Menu size={18} />}
            {isSidebarOpen && "Collapse Menu"}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 z-40">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                className="pl-10 bg-slate-50 border-slate-200 w-full" 
                placeholder="Search areas, shelters, or reporting location..." 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-200">
                  <Plus size={18} />
                  Report Incident
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Submit Emergency Report</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Incident Type</Label>
                    <Select value={newReport.type} onValueChange={(val) => setNewReport({...newReport, type: val as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(HAZARD_TYPES).map(([key, value]) => (
                          <SelectItem key={key} value={key}>{value.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Severity Level</Label>
                    <Select value={newReport.severity} onValueChange={(val) => setNewReport({...newReport, severity: val as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Monitor</SelectItem>
                        <SelectItem value="medium">Medium - Caution</SelectItem>
                        <SelectItem value="high">High - Immediate Risk</SelectItem>
                        <SelectItem value="critical">Critical - Life Threatening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      placeholder="Describe the situation..." 
                      value={newReport.description}
                      onChange={(e) => setNewReport({...newReport, description: e.target.value})}
                    />
                  </div>
                  <Button className="w-full bg-red-600 hover:bg-red-700" onClick={submitReport}>
                    Broadcast Emergency Alert
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </Button>
          </div>
        </header>

        {/* Dynamic Viewport */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Workspace (Map or Lists) */}
          <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {activeTab === 'map' && "Real-time Evacuation Grid"}
                  {activeTab === 'shelters' && "Emergency Shelter Directory"}
                  {activeTab === 'alerts' && "Active Emergency Broadcasts"}
                  {activeTab === 'analytics' && "AI Regional Risk Metrics"}
                </h2>
                <p className="text-slate-500 text-sm">
                  {activeTab === 'map' && "Live hazard monitoring and safe-route navigation."}
                  {activeTab === 'shelters' && "Locate and check occupancy of nearby safe zones."}
                  {activeTab === 'alerts' && "Crowd-sourced and official emergency updates."}
                  {activeTab === 'analytics' && "Predictive analysis based on current environmental data."}
                </p>
              </div>
              
              {activeTab === 'map' && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant={routingMode ? "default" : "outline"} 
                    className="gap-2"
                    onClick={() => {
                      setRoutingMode(!routingMode);
                      if (!routingMode) {
                        toast.info("Routing mode active. Click map to set start point.");
                      } else {
                        setStartPoint(null);
                        setEndPoint(null);
                      }
                    }}
                  >
                    <Navigation2 size={18} className={routingMode ? "animate-pulse" : ""} />
                    {routingMode ? "Cancel Navigation" : "Calculate Safe Route"}
                  </Button>
                </div>
              )}
            </div>

            <div className="flex-1 min-h-0 bg-white rounded-2xl shadow-sm border overflow-hidden">
              {activeTab === 'map' && (
                <SafeMap 
                  hazards={hazards} 
                  shelters={shelters} 
                  routingMode={routingMode}
                  startPoint={startPoint}
                  endPoint={endPoint}
                  onMapClick={handleMapClick}
                />
              )}

              {activeTab === 'shelters' && (
                <ScrollArea className="h-full p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shelters.map(s => (
                      <ShelterCard key={s.id} shelter={s} />
                    ))}
                  </div>
                </ScrollArea>
              )}

              {activeTab === 'alerts' && (
                <ScrollArea className="h-full">
                  <div className="divide-y">
                    {hazards.map(h => (
                      <AlertItem key={h.id} hazard={h} />
                    ))}
                  </div>
                </ScrollArea>
              )}

              {activeTab === 'analytics' && (
                <div className="h-full p-8 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center animate-pulse">
                    <Activity size={48} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">AI Predictive Model Loading</h3>
                    <p className="text-slate-500 max-w-md mx-auto mt-2">
                      Aggregating satellite imagery, weather patterns, and user reports to generate 24-hour predictive risk heatmaps.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-8 w-full max-w-2xl">
                    <RiskMetric label="Flood Probability" value="64%" trend="up" />
                    <RiskMetric label="Infrastructure Integrity" value="Good" trend="stable" />
                    <RiskMetric label="Response Capacity" value="High" trend="down" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Contextual Info */}
          <aside className="w-80 border-l bg-white flex flex-col shrink-0">
            <div className="p-4 border-b">
              <h3 className="font-bold flex items-center gap-2">
                <Radio size={16} className="text-red-500" />
                Live Feed
              </h3>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                <Card className="bg-red-50 border-red-100 shadow-none">
                  <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-sm text-red-700 flex items-center gap-2">
                      <AlertOctagon size={14} /> Critical Warning
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <p className="text-xs text-red-600">Flash flood warning extended for Tana River and Nairobi outskirts. Move to higher ground immediately.</p>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Nearby Safe Shelters</h4>
                  {shelters.slice(0, 3).map(s => (
                    <div key={s.id} className="group p-3 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer bg-slate-50/50">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold truncate">{s.name}</span>
                        <Badge variant="outline" className="text-[10px] h-4 px-1">{Math.round((s.occupancy/s.capacity)*100)}% full</Badge>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-2">{s.address}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1">
                          {s.features.slice(0, 3).map((f, i) => (
                            <div key={i} title={f} className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                              {f.includes('Med') && <HeartPulse size={10} className="text-red-500" />}
                              {f.includes('Food') && <Activity size={10} className="text-orange-500" />}
                              {f.includes('WiFi') && <Radio size={10} className="text-blue-500" />}
                            </div>
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400">Available services</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Recent Reports</h4>
                  {hazards.slice(0, 3).map(h => (
                    <div key={h.id} className="flex gap-3">
                      <div className={`w-1 h-10 rounded-full ${HAZARD_TYPES[h.type].color === '#3b82f6' ? 'bg-blue-500' : 'bg-red-500'}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{HAZARD_TYPES[h.type].label}</p>
                        <p className="text-[10px] text-slate-500 truncate">{h.description}</p>
                        <span className="text-[10px] text-slate-400">{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>

            <div className="p-4 bg-slate-50 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400">DEMO MODE</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                This interface demonstrates core SafeRoute features for hackathon evaluation. Real-time data would be powered by FastAPI/PostGIS backend.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick, isOpen, count }: { icon: any, label: string, active: boolean, onClick: () => void, isOpen: boolean, count?: number }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
        active 
          ? 'bg-primary/10 text-primary font-semibold shadow-sm' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon size={20} />
      {isOpen && (
        <>
          <span className="flex-1 text-left text-sm whitespace-nowrap">{label}</span>
          {count !== undefined && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'}`}>
              {count}
            </span>
          )}
        </>
      )}
    </button>
  );
}

function ShelterCard({ shelter }: { shelter: Shelter }) {
  const occupancyRate = (shelter.occupancy / shelter.capacity) * 100;
  return (
    <Card className="overflow-hidden group hover:shadow-md transition-shadow">
      <div className="h-32 bg-slate-100 relative overflow-hidden">
        <img 
          src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/59ded8b7-2200-4940-8971-f2645d26d24c/emergency-shelter-representative-185d489d-1778934653498.webp" 
          alt={shelter.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2">
          <Badge className={occupancyRate > 90 ? "bg-red-500" : occupancyRate > 70 ? "bg-yellow-500" : "bg-green-500"}>
            {occupancyRate > 90 ? "Critical Capacity" : occupancyRate > 70 ? "Filling Up" : "Available"}
          </Badge>
        </div>
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-base">{shelter.name}</CardTitle>
        <CardDescription className="text-xs">{shelter.address}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span>Occupancy</span>
            <span>{shelter.occupancy} / {shelter.capacity}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${occupancyRate > 90 ? 'bg-red-500' : 'bg-primary'}`} 
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {shelter.features.map(f => (
            <Badge key={f} variant="secondary" className="text-[10px] font-normal px-2 py-0">
              {f}
            </Badge>
          ))}
        </div>
        <Button variant="outline" size="sm" className="w-full text-xs h-8">View Route to Shelter</Button>
      </CardContent>
    </Card>
  );
}

function AlertItem({ hazard }: { hazard: HazardZone }) {
  const config = HAZARD_TYPES[hazard.type];
  return (
    <div className="p-4 hover:bg-slate-50 transition-colors flex gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
        hazard.severity === 'critical' ? 'bg-red-100 text-red-600' : 
        hazard.severity === 'high' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
      }`}>
        <config.icon size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-bold text-sm truncate">{config.label} Alert</h4>
          <span className="text-[10px] text-slate-400 font-medium">{new Date(hazard.timestamp).toLocaleString()}</span>
        </div>
        <p className="text-xs text-slate-600 line-clamp-2 mb-2">{hazard.description}</p>
        <div className="flex items-center gap-2">
          <Badge className={`uppercase text-[9px] h-4 px-1 ${
             hazard.severity === 'critical' ? 'bg-red-600' : 
             hazard.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
          }`}>
            {hazard.severity}
          </Badge>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <MapPin size={10} /> {hazard.center[0].toFixed(3)}, {hazard.center[1].toFixed(3)}
          </span>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="shrink-0 text-slate-400">
        <ChevronRight size={20} />
      </Button>
    </div>
  );
}

function RiskMetric({ label, value, trend }: { label: string, value: string, trend: 'up' | 'down' | 'stable' }) {
  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-end justify-between">
        <span className="text-xl font-bold">{value}</span>
        {trend === 'up' && <ChevronRight size={14} className="text-red-500 -rotate-90" />}
        {trend === 'down' && <ChevronRight size={14} className="text-green-500 rotate-90" />}
        {trend === 'stable' && <div className="w-3 h-0.5 bg-slate-300 mb-2" />}
      </div>
    </div>
  );
}