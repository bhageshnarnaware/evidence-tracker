import { motion } from 'framer-motion';
import { FolderOpen, Smartphone, Shield, ArrowRightLeft, Archive, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { useDataStore } from '@/contexts/DataStoreContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const caseBarData = [
  { month: 'Jan', cases: 3 },
  { month: 'Feb', cases: 5 },
  { month: 'Mar', cases: 4 },
  { month: 'Apr', cases: 7 },
  { month: 'May', cases: 2 },
  { month: 'Jun', cases: 6 },
];

const evidenceColors: Record<string, string> = {
  Sealed: 'hsl(152, 69%, 40%)',
  'Under Analysis': 'hsl(195, 90%, 50%)',
  'In Transit': 'hsl(38, 92%, 50%)',
  'In Storage': 'hsl(215, 15%, 55%)',
  Returned: 'hsl(0, 0%, 45%)',
};

const Dashboard = () => {
  const { cases, devices, evidence, custodyLogs, auditLogs } = useDataStore();

  const openCases = cases.filter(c => c.case_status === 'Open').length;
  const closedCases = cases.filter(c => c.case_status === 'Closed').length;
  const inStorage = evidence.filter(e => e.current_status === 'In Storage' || e.current_status === 'Sealed').length;

  const statCards = [
    { label: 'Total Cases', value: cases.length, icon: FolderOpen, color: 'text-primary' },
    { label: 'Open Investigations', value: openCases, icon: AlertTriangle, color: 'text-warning' },
    { label: 'Devices Seized', value: devices.length, icon: Smartphone, color: 'text-info' },
    { label: 'Evidence Transfers', value: custodyLogs.length, icon: ArrowRightLeft, color: 'text-primary' },
    { label: 'In Storage', value: inStorage, icon: Archive, color: 'text-success' },
    { label: 'Closed Cases', value: closedCases, icon: TrendingUp, color: 'text-muted-foreground' },
  ];

  // Build evidence status data from real data
  const statusCounts: Record<string, number> = {};
  evidence.forEach(ev => { statusCounts[ev.current_status] = (statusCounts[ev.current_status] || 0) + 1; });
  const evidenceStatusData = Object.entries(statusCounts).map(([name, value]) => ({
    name, value, color: evidenceColors[name] || 'hsl(215, 15%, 55%)',
  }));

  const recentLogs = [...auditLogs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const recentCases = [...cases]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">System overview and activity</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-forensic"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-forensic">
          <h2 className="text-sm font-semibold mb-4">Cases This Year</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={caseBarData}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="cases" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-forensic">
          <h2 className="text-sm font-semibold mb-4">Evidence by Status</h2>
          {evidenceStatusData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={180}>
                <PieChart>
                  <Pie data={evidenceStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {evidenceStatusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {evidenceStatusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                    <span className="text-xs font-semibold ml-auto pl-4">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm py-8">No evidence data</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-forensic">
          <h2 className="text-sm font-semibold mb-4">Recent Cases</h2>
          <div className="space-y-3">
            {recentCases.map((c) => (
              <div key={c.case_id} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium truncate max-w-[180px]">{c.case_title}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{c.case_id}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.case_status === 'Open' ? 'status-analysis' : 'status-sealed'}`}>{c.case_status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-forensic">
          <h2 className="text-sm font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div key={log.log_id} className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{log.user_name} · {log.action} {log.entity_type}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {recentLogs.length === 0 && <p className="text-xs text-muted-foreground">No activity yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
