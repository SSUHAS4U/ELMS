import { useUser } from '@clerk/clerk-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Tilt from 'react-parallax-tilt';
import CountUp from 'react-countup';
import MagneticButton from '../components/motion/MagneticButton';

const mockData = [
  { name: 'Jan', requests: 4 },
  { name: 'Feb', requests: 7 },
  { name: 'Mar', requests: 2 },
  { name: 'Apr', requests: 15 },
  { name: 'May', requests: 9 },
  { name: 'Jun', requests: 4 },
];

const BentoCard = ({ children, className = "" }) => (
  <Tilt tiltMaxAngleDeg={4} glareEnable={true} glareMaxOpacity={0.08} glareColor="#00FF87" perspective={1200} scale={1.01} className={`h-full ${className}`}>
    <div className="bento-card h-full flex flex-col">
      {children}
    </div>
  </Tilt>
);

export default function Dashboard() {
  const { user } = useUser();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[180px]">
      
      {/* Welcome & Stats */}
      <div className="col-span-1 md:col-span-2 xl:col-span-2 row-span-1">
        <BentoCard>
          <div className="flex flex-col justify-center h-full">
            <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.firstName}</h2>
            <p className="text-[color:var(--text-secondary)]">
              You have <span className="text-[color:var(--accent-primary)] font-bold"><CountUp end={10} duration={2} /> days</span> of annual leave remaining.
            </p>
          </div>
        </BentoCard>
      </div>

      {/* Quick Apply Button */}
      <div className="col-span-1 xl:col-span-1 row-span-1">
        <MagneticButton className="w-full h-full p-0">
          <BentoCard className="flex items-center justify-center cursor-pointer group border border-[color:var(--accent-primary)]/50 bg-[color:var(--accent-primary)]/5 hover:bg-[color:var(--accent-primary)]/10 transition-all w-full">
            <div className="text-center w-full">
              <div className="w-12 h-12 rounded-full bg-[color:var(--accent-primary)] text-black mx-auto mb-3 flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(0,255,135,0.6)] transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              </div>
              <h3 className="font-semibold text-lg text-[color:var(--accent-primary)] group-hover:text-white transition-colors">Apply for Leave</h3>
            </div>
          </BentoCard>
        </MagneticButton>
      </div>

      {/* Chart */}
      <div className="col-span-1 md:col-span-3 xl:col-span-3 row-span-2">
        <BentoCard>
          <h3 className="font-semibold text-lg mb-4">Leave Trends (2026)</h3>
          <div className="flex-1 w-full h-[220px]">
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF87" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00FF87" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Area type="monotone" dataKey="requests" stroke="#00FF87" strokeWidth={3} fillOpacity={1} fill="url(#colorRequests)" isAnimationActive={true} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </BentoCard>
      </div>

      {/* Recent Requests */}
      <div className="col-span-1 md:col-span-3 xl:col-span-4 row-span-2">
        <BentoCard>
          <h3 className="font-semibold text-lg mb-4">Recent Requests</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[color:var(--text-secondary)] border-b border-[color:var(--border-subtle)]">
                <tr>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Duration</th>
                  <th className="pb-3 font-medium">Days</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border-subtle)]">
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="py-3">Sick Leave</td>
                    <td className="py-3 text-[color:var(--text-secondary)]">Mar 12, 2026 - Mar 14, 2026</td>
                    <td className="py-3">3</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium border border-[#FFAA00]/20 text-[#FFAA00] bg-[#FFAA00]/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FFAA00] animate-pulse"></div>
                        Pending
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BentoCard>
      </div>

    </div>
  );
}
