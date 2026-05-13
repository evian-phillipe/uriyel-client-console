import { ClipboardList, CircleDollarSign, Sparkles } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import MetricCard from '../components/MetricCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import Pill from '../components/Pill.jsx';
import { paymentProducts } from '../data/mockData.js';

export default function Sales() {
  const { metrics } = useOutletContext();

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="Sales" title="Deposits, balances and premium upgrades.">
        The commercial console should make revenue visible immediately: paid, unpaid, deposit-only, comped and balance-due guests.
      </SectionHeader>

      <section className="metric-grid three">
        <MetricCard label="Collected" value={`£${metrics.revenue.toLocaleString()}`} detail="Paid and deposit payments captured." icon={CircleDollarSign} />
        <MetricCard label="Outstanding" value={`£${metrics.outstanding.toLocaleString()}`} detail="Balances to collect before pass activation." icon={ClipboardList} />
        <MetricCard label="Upgrade potential" value={`£${metrics.upgradePotential.toLocaleString()}`} detail="VIP, dinner, sauna and accommodation add-ons." icon={Sparkles} />
      </section>

      <section className="panel-card">
        <div className="panel-heading-row">
          <div>
            <p className="eyebrow">Payment catalogue</p>
            <h2>Stripe products for v1</h2>
          </div>
          <button className="primary-button" type="button">Create payment link</button>
        </div>

        <div className="product-grid">
          {paymentProducts.map((product) => (
            <article className="product-card" key={product.id}>
              <div>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
              </div>
              <div className="product-footer">
                <strong>£{product.price}</strong>
                <Pill tone={product.type === 'Deposit' ? 'warn' : 'neutral'}>{product.type}</Pill>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
