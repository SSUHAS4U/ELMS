import { useEffect, useState } from 'react';
import { Laptop, Smartphone, Monitor, Keyboard, Mouse, Package, Calendar, Hash } from 'lucide-react';
import api from '../../lib/api';
import useAuthStore from '../../hooks/useAuthStore';
import { toast } from 'sonner';
import { PageHeader, MotionCard, Badge, EmptyState, SkeletonCard } from '../../components/ui';

const CATEGORY_ICONS = { laptop: Laptop, phone: Smartphone, monitor: Monitor, keyboard: Keyboard, mouse: Mouse, default: Package };

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

  return (
    <div className="space-y-6 pb-12">
      <PageHeader eyebrow="Equipment" title="My Assets" icon={Monitor} subtitle="Company equipment currently assigned to you." />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
      ) : assets.length === 0 ? (
        <EmptyState icon={Monitor} title="No assets assigned" description="Contact IT or your admin if you believe this is incorrect." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset, i) => {
            const Icon = CATEGORY_ICONS[asset.category?.toLowerCase()] || CATEGORY_ICONS.default;
            return (
              <MotionCard key={asset._id} delay={i * 0.05} className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[color:var(--accent-glow)] grid place-items-center text-accent ring-1 ring-inset ring-accent/15 shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-content truncate">{asset.name}</div>
                    <div className="text-sm text-content-secondary capitalize">{asset.category}</div>
                  </div>
                </div>
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-content-secondary"><Hash className="w-3.5 h-3.5" /> Serial <span className="font-mono text-content">{asset.serialNumber || 'N/A'}</span></div>
                  <div className="flex items-center gap-2 text-xs text-content-secondary"><Calendar className="w-3.5 h-3.5" /> Assigned {asset.assignedDate ? new Date(asset.assignedDate).toLocaleDateString('en-GB') : 'N/A'}</div>
                </div>
                <div className="mt-4 pt-4 border-t border-line/60"><Badge tone="approved">Active</Badge></div>
              </MotionCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Assets;
