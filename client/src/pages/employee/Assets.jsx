import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Calendar, Hash } from 'lucide-react';
import api from '../../lib/api';
import useAuthStore from '../../hooks/useAuthStore';
import { toast } from 'sonner';

const Assets = () => {
  const { user } = useAuthStore();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/assets?employee_id=${user._id}&returned=false`);
        setAssets(res.data.assets || []);
      } catch (error) {
        if (error.response?.status === 404) setAssets([]);
        else toast.error('Failed to load assets');
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchAssets();
  }, [user]);

  const CATEGORY_ICONS = {
    laptop: '💻', phone: '📱', monitor: '🖥️', keyboard: '⌨️', mouse: '🖱️', default: '📦'
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[color:var(--text-primary)]">My Assets</h1>
        <p className="text-sm text-[color:var(--text-secondary)] mt-1">Assets currently assigned to you</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[color:var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-16 bg-[color:var(--bg-surface)] border border-dashed border-[color:var(--border-subtle)] rounded-xl">
          <Monitor className="w-12 h-12 mx-auto mb-4 text-[color:var(--text-secondary)] opacity-40" />
          <div className="text-[color:var(--text-secondary)] font-medium">No assets assigned to you</div>
          <div className="text-sm text-[color:var(--text-secondary)] mt-1 opacity-60">Contact IT or admin if you believe this is incorrect</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset, i) => (
            <motion.div
              key={asset._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">
                  {CATEGORY_ICONS[asset.category?.toLowerCase()] || CATEGORY_ICONS.default}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[color:var(--text-primary)] truncate">{asset.name}</div>
                  <div className="text-sm text-[color:var(--text-secondary)] capitalize">{asset.category}</div>
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[color:var(--text-secondary)]">
                      <Hash className="w-3 h-3" /> Serial: <span className="font-mono">{asset.serialNumber || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[color:var(--text-secondary)]">
                      <Calendar className="w-3 h-3" /> Assigned: {asset.assignedDate ? new Date(asset.assignedDate).toLocaleDateString('en-GB') : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-[color:var(--border-subtle)]">
                <span className="text-xs px-2 py-1 rounded-full bg-[color:var(--success)]/10 text-[color:var(--success)] border border-[color:var(--success)]/20 font-semibold">
                  Active
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Assets;
