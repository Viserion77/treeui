import { useMemo, useState } from 'react';
import { TBadge, TButton, TCard, TInput } from '@treeui/react';
import type { TSize } from '@treeui/react';
import { currency, orders, stats, statusTone, type OrderStatus } from './data';
import { DEFAULTS, useDashboardConfig, type ThemeMode } from './config';
import logoUrl from './assets/treeui-logo.svg';

const themeOptions: Array<{ label: string; value: ThemeMode }> = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

const densityOptions: Array<{ label: string; value: TSize }> = [
  { label: 'Compact', value: 'sm' },
  { label: 'Comfortable', value: 'md' },
  { label: 'Spacious', value: 'lg' },
];

const accentPresets = ['#2057d4', '#117c50', '#6d28d9', '#c2410c', '#be185d'];

const statusFilters: Array<{ label: string; value: OrderStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Paid', value: 'paid' },
  { label: 'Pending', value: 'pending' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Failed', value: 'failed' },
];

export function App() {
  const { config, update, reset } = useDashboardConfig();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const [customizeOpen, setCustomizeOpen] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = status === 'all' || order.status === status;
      const matchesTerm =
        !term ||
        order.customer.toLowerCase().includes(term) ||
        order.product.toLowerCase().includes(term) ||
        order.id.toLowerCase().includes(term);
      return matchesStatus && matchesTerm;
    });
  }, [search, status]);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar__brand">
          <img src={logoUrl} alt="" className="topbar__logo" />
          <span className="topbar__name">Orchard</span>
          <TBadge tone="info" size="sm">
            React demo
          </TBadge>
        </div>
        <div className="topbar__actions">
          <TButton
            variant={customizeOpen ? 'solid' : 'outline'}
            size="sm"
            aria-expanded={customizeOpen}
            aria-controls="customize-panel"
            onClick={() => setCustomizeOpen((open) => !open)}
          >
            Customize
          </TButton>
        </div>
      </header>

      {customizeOpen ? (
        <TCard
          id="customize-panel"
          variant="soft"
          size={config.density}
          className="customize"
          header={<strong>Customize dashboard</strong>}
          footer={
            <div className="customize__footer">
              <span className="muted">Preferences are saved on this device.</span>
              <TButton variant="ghost" size="sm" onClick={reset}>
                Restore defaults
              </TButton>
            </div>
          }
        >
          <div className="customize__grid">
            <fieldset className="option">
              <legend>Theme</legend>
              <div className="option__row" role="group" aria-label="Theme">
                {themeOptions.map((option) => (
                  <TButton
                    key={option.value}
                    size="sm"
                    variant={config.theme === option.value ? 'solid' : 'outline'}
                    aria-pressed={config.theme === option.value}
                    onClick={() => update({ theme: option.value })}
                  >
                    {option.label}
                  </TButton>
                ))}
              </div>
            </fieldset>

            <fieldset className="option">
              <legend>Density</legend>
              <div className="option__row" role="group" aria-label="Density">
                {densityOptions.map((option) => (
                  <TButton
                    key={option.value}
                    size="sm"
                    variant={config.density === option.value ? 'solid' : 'outline'}
                    aria-pressed={config.density === option.value}
                    onClick={() => update({ density: option.value })}
                  >
                    {option.label}
                  </TButton>
                ))}
              </div>
            </fieldset>

            <fieldset className="option">
              <legend>Accent color</legend>
              <div className="option__row">
                {accentPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`swatch${config.accent === preset ? ' is-active' : ''}`}
                    style={{ background: preset }}
                    aria-label={`Accent ${preset}`}
                    aria-pressed={config.accent === preset}
                    onClick={() => update({ accent: preset })}
                  />
                ))}
                <input
                  type="color"
                  className="swatch-picker"
                  value={config.accent || DEFAULTS.accent}
                  aria-label="Custom accent color"
                  onChange={(event) => update({ accent: event.target.value })}
                />
              </div>
            </fieldset>
          </div>
        </TCard>
      ) : null}

      <main className="content">
        <section className="stats" aria-label="Key metrics">
          {stats.map((stat) => (
            <TCard key={stat.label} variant="outline" size={config.density}>
              <div className="stat">
                <span className="stat__label">{stat.label}</span>
                <span className="stat__value">{stat.value}</span>
                <TBadge tone={stat.tone} size="sm">
                  {stat.trend}
                </TBadge>
              </div>
            </TCard>
          ))}
        </section>

        <TCard
          variant="outline"
          size={config.density}
          header={
            <div className="orders-toolbar">
              <TInput
                type="search"
                size={config.density}
                placeholder="Search orders…"
                aria-label="Search orders"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="orders-toolbar__search"
              />
              <div className="orders-toolbar__filters" role="group" aria-label="Filter by status">
                {statusFilters.map((filter) => (
                  <TButton
                    key={filter.value}
                    size="sm"
                    variant={status === filter.value ? 'soft' : 'ghost'}
                    aria-pressed={status === filter.value}
                    onClick={() => setStatus(filter.value)}
                  >
                    {filter.label}
                  </TButton>
                ))}
              </div>
            </div>
          }
          footer={<span className="muted">{filtered.length} orders</span>}
        >
          {filtered.length === 0 ? (
            <div className="empty">
              <p className="empty__title">No matching orders</p>
              <p className="muted">Try a different search term or clear the status filter.</p>
              <TButton
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setStatus('all');
                }}
              >
                Clear filters
              </TButton>
            </div>
          ) : (
            <div className="table-wrap">
              <table className={`orders orders--${config.density}`}>
                <thead>
                  <tr>
                    <th scope="col">Order</th>
                    <th scope="col">Customer</th>
                    <th scope="col">Product</th>
                    <th scope="col">Date</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="num">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{order.product}</td>
                      <td>{order.date}</td>
                      <td>
                        <TBadge tone={statusTone[order.status]} size="sm">
                          {order.status}
                        </TBadge>
                      </td>
                      <td className="num">{currency.format(order.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TCard>
      </main>

      <footer className="foot">
        <span className="muted">
          Built with @treeui/react primitives on shared design tokens. The complete component set
          lives in <a href="../dashboard-vue/">the Vue example</a>.
        </span>
      </footer>
    </div>
  );
}
