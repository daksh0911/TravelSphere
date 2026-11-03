import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  BarChart3,
  Package,
  TrendingUp,
  UserCheck
} from 'lucide-react';

export default function AdminAnalytics({
  monthlyRevenueData,
  categoryDistributionData,
  providerVelocityData
}) {
  return (
    <div className="analytics-charts-grid">
      <div className="admin-panel-card chart-card-wide">
        <div className="panel-header">
          <div>
            <h3><BarChart3 size={20} /> Revenue &amp; Booking Volume Trajectory</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--admin-muted)' }}>
              Live 2025–2026 Gross Transaction Value (GTV) and booking velocity.
            </p>
          </div>
          <span className="kpi-trend green" style={{ padding: '0.35rem 0.75rem', borderRadius: '20px', background: '#ecfdf5' }}>
            <TrendingUp size={14} /> +18.4% MoM
          </span>
        </div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="copperGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a3704c" stopOpacity={0.45}/>
                  <stop offset="95%" stopColor="#a3704c" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
              <Tooltip
                contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                formatter={(value, name) => [name === 'Gross Revenue ($)' ? `${value.toLocaleString()}` : value, name]}
              />
              <Legend wrapperStyle={{ fontSize: '0.825rem', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="revenue" name="Gross Revenue ($)" stroke="#a3704c" strokeWidth={2.5} fillOpacity={1} fill="url(#copperGradient)" />
              <Area type="monotone" dataKey="bookings" name="Monthly Bookings" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#blueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="admin-panel-card chart-card-donut">
        <div className="panel-header">
          <div>
            <h3><Package size={20} /> Service Distribution</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--admin-muted)' }}>
              Share of catalog offerings across provider sectors.
            </p>
          </div>
        </div>
        <div style={{ width: '100%', height: 210 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryDistributionData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                {categoryDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}
                formatter={(value) => [`${value}%`, 'Catalog Share']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="donut-legend-grid">
          {categoryDistributionData.map(item => (
            <div key={item.name} className="donut-legend-item">
              <span className="donut-dot" style={{ background: item.color }} />
              <span className="donut-name">{item.name}</span>
              <span className="donut-pct">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-panel-card chart-card-bar">
        <div className="panel-header">
          <div>
            <h3><UserCheck size={20} /> Provider Onboarding Velocity</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--admin-muted)' }}>
              Quarterly applications approved vs pending security clearance.
            </p>
          </div>
        </div>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={providerVelocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="quarter" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }} />
              <Legend wrapperStyle={{ fontSize: '0.825rem', paddingTop: '8px' }} />
              <Bar dataKey="approved" name="Approved Providers" fill="#a3704c" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" name="Pending Review" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
