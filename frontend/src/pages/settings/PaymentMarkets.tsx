import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, CircleAlert, Globe2, Landmark, Loader2, QrCode, Save, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { client } from '@/lib/api';
import { getPaymentMarket, PAYMENT_MARKETS } from '@/config/payment-markets';
import { toast } from 'sonner';

type MerchantConfig = {
  payment_market: string;
  default_settlement_method: 'local_t0' | 'usdt_t0';
};

export default function PaymentMarkets() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<MerchantConfig>({ payment_market: 'PH', default_settlement_method: 'local_t0' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const market = getPaymentMarket(config.payment_market);

  const load = useCallback(async () => {
    try {
      const response = await client.get('/api/v1/merchant/api-config');
      if (response.ok && response.data) {
        setConfig({
          payment_market: response.data.payment_market || 'PH',
          default_settlement_method: response.data.default_settlement_method || 'local_t0',
        });
      }
    } catch {
      toast.error('Unable to load payment market settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const response = await client.patch('/api/v1/merchant/api-config', config);
      if (!response.ok) throw new Error();
      toast.success('Payment market settings saved');
    } catch {
      toast.error('Unable to save payment market settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><div className="min-h-[400px] flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" size={32} /></div></Layout>;

  return (
    <Layout>
      <div className="page-enter pb-20 max-w-5xl">
        <div className="flex items-center gap-2 text-[12px] text-slate-400 mb-8 font-medium"><span className="cursor-pointer hover:text-slate-600" onClick={() => navigate('/settings')}>Settings</span><span>/</span><span className="text-slate-600 font-semibold">Payment markets</span></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-10">
          <div className="flex items-center gap-5"><button onClick={() => navigate('/settings')} className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"><ChevronLeft size={20} /></button><div><h1 className="text-2xl font-semibold tracking-tight text-slate-900 m-0">Payment markets</h1><p className="text-sm text-slate-500 mt-1 mb-0">Choose the country used to present local checkout methods.</p></div></div>
          <button onClick={save} disabled={saving} className="inline-flex items-center justify-center gap-2 bg-[#FF6B00] text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"><>{saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}</>Save changes</button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex gap-3 text-amber-900"><CircleAlert className="shrink-0 text-amber-600" size={20} /><p className="text-sm leading-6 m-0"><strong>Provider-ready configuration.</strong> The methods below are market recommendations. They remain unavailable for live payment processing until your business completes provider onboarding and adds approved credentials.</p></div>

        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-8 items-start">
          <section className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
            <div className="flex items-center gap-3 mb-5"><div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 grid place-items-center"><Globe2 size={20} /></div><div><h2 className="text-base font-semibold text-slate-900 m-0">Operating market</h2><p className="text-xs text-slate-500 mt-1 mb-0">This changes the available method catalog.</p></div></div>
            <label className="text-sm font-semibold text-slate-700 block mb-2" htmlFor="payment-market">Country and launch city</label>
            <select id="payment-market" value={config.payment_market} onChange={(event) => setConfig({ ...config, payment_market: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#FF6B00]">
              {PAYMENT_MARKETS.map((item) => <option key={item.code} value={item.code}>{item.country} - {item.city}</option>)}
            </select>
            <div className="mt-7 pt-6 border-t border-slate-100"><p className="text-sm font-semibold text-slate-700 mt-0 mb-3">Default settlement</p><div className="space-y-3">
              <SettlementOption checked={config.default_settlement_method === 'local_t0'} label={`Local T+0 (${market.currency})`} description="Settle through your approved local banking partner." onChange={() => setConfig({ ...config, default_settlement_method: 'local_t0' })} />
              <SettlementOption checked={config.default_settlement_method === 'usdt_t0'} label="USDT T+0" description="Settle through an approved USDT custody or on-ramp provider." onChange={() => setConfig({ ...config, default_settlement_method: 'usdt_t0' })} />
            </div></div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-7"><div><p className="text-xs font-semibold uppercase tracking-widest text-[#FF6B00] mt-0 mb-2">{market.city}</p><h2 className="text-xl font-semibold text-slate-900 m-0">{market.country} checkout methods</h2><p className="text-sm text-slate-500 mt-2 mb-0">Recommended provider: {market.provider}</p></div><span className="text-xs font-semibold rounded-full bg-slate-100 text-slate-600 px-3 py-1.5 whitespace-nowrap">{market.currency}</span></div>
            <MethodGroup icon={<QrCode size={18} />} title="QR payments" methods={market.qr} />
            <MethodGroup icon={<Wallet size={18} />} title="Wallets" methods={market.wallets} />
            <MethodGroup icon={<Landmark size={18} />} title="Local banks" methods={market.banks} />
          </section>
        </div>
      </div>
    </Layout>
  );
}

function SettlementOption({ checked, label, description, onChange }: { checked: boolean; label: string; description: string; onChange: () => void }) {
  return <label className={`block cursor-pointer rounded-xl border p-4 transition-colors ${checked ? 'border-[#FF6B00] bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}><div className="flex items-start gap-3"><input type="radio" checked={checked} onChange={onChange} className="mt-1 accent-[#FF6B00]" /><div><p className="text-sm font-semibold text-slate-900 m-0">{label}</p><p className="text-xs leading-5 text-slate-500 mt-1 mb-0">{description}</p></div></div></label>;
}

function MethodGroup({ icon, title, methods }: { icon: React.ReactNode; title: string; methods: string[] }) {
  return <div className="border-t border-slate-100 py-5 first:border-t-0 first:pt-0"><div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">{icon}{title}</div><div className="flex flex-wrap gap-2">{methods.map((method) => <span key={method} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">{method}<span className="block text-[10px] text-amber-600 mt-0.5">Requires connection</span></span>)}</div></div>;
}
