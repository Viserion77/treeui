import { useMemo, useState } from 'react';
import { TBadge, TButton, TCard, TInput } from '@treeui/react';
import type { TSize } from '@treeui/react';
import {
  channelMonths,
  channelNames,
  currency,
  orders,
  stats,
  statusTone,
  type ChannelMonth,
  type OrderStatus,
} from './data';
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

const accentPresets = ['#0969da', '#1a7f37', '#6d28d9', '#c2410c', '#be185d'];

const statusFilters: Array<{ label: string; value: OrderStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Paid', value: 'paid' },
  { label: 'Pending', value: 'pending' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Failed', value: 'failed' },
];

// --- KPI sparklines -----------------------------------------------------------
const SPARK_W = 96;
const SPARK_H = 32;
const SPARK_PAD = 3;

function sparkPaths(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((value, index) => ({
    x: SPARK_PAD + (index * (SPARK_W - SPARK_PAD * 2)) / (values.length - 1),
    y: SPARK_H - SPARK_PAD - ((value - min) / range) * (SPARK_H - SPARK_PAD * 2),
  }));
  const line = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `M${line.replaceAll(' ', ' L')} L${SPARK_W - SPARK_PAD},${SPARK_H - SPARK_PAD} L${SPARK_PAD},${SPARK_H - SPARK_PAD} Z`;
  return { line, area, end: points[points.length - 1] };
}

const sparks = stats.map((stat) => sparkPaths(stat.spark));

// --- Sessions by channel chart --------------------------------------------------
const CHART_MAX = 160;
const chartTicks = [0, 40, 80, 120, 160];

const monthTotal = (month: ChannelMonth) => month.values.reduce((sum, value) => sum + value, 0);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function App() {
  const { config, update, reset } = useDashboardConfig();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [customerName, setCustomerName] = useState('Marina');
  const [customerEmail, setCustomerEmail] = useState('marina@company');

  const emailError =
    customerEmail && !EMAIL_PATTERN.test(customerEmail) ? 'Enter a valid email address.' : '';

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
          {stats.map((stat, index) => (
            <TCard key={stat.label} variant="outline" size={config.density}>
              <div className="stat">
                <span className="stat__label">{stat.label}</span>
                <span className="stat__value">{stat.value}</span>
                <div className="stat__row">
                  <TBadge tone={stat.tone} size="sm">
                    {stat.trend}
                  </TBadge>
                  <svg
                    className="kpi-spark"
                    viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
                    width={SPARK_W}
                    height={SPARK_H}
                    aria-hidden="true"
                  >
                    <path className="kpi-spark__area" d={sparks[index].area} />
                    <polyline className="kpi-spark__line" points={sparks[index].line} />
                    <circle
                      className="kpi-spark__dot"
                      cx={sparks[index].end.x}
                      cy={sparks[index].end.y}
                      r={2.5}
                    />
                  </svg>
                </div>
              </div>
            </TCard>
          ))}
        </section>

        <div className="board">
          <div className="board__main">
            <TCard
              variant="outline"
              size={config.density}
              header={
                <div className="card-head">
                  <strong>
                    Sessions by channel <span className="muted">· k/month</span>
                  </strong>
                  <TBadge variant="outline" size="sm">
                    last 7 months
                  </TBadge>
                </div>
              }
            >
              <div
                className="channels"
                role="img"
                aria-label="Stacked bar chart of monthly sessions in thousands, split by channel. Totals grow from 98 thousand in January to 142 thousand in July."
              >
                <div className="channels__plot">
                  {chartTicks.map((tick) => (
                    <div
                      key={tick}
                      className="channels__gridline"
                      style={{ bottom: `${(tick / CHART_MAX) * 100}%` }}
                    >
                      <span className="channels__tick">{tick}</span>
                    </div>
                  ))}
                  <div className="channels__cols">
                    {channelMonths.map((month) => (
                      <div key={month.month} className="channels__col">
                        <span className="channels__total">{monthTotal(month)}</span>
                        <div
                          className="channels__stack"
                          style={{ height: `${(monthTotal(month) / CHART_MAX) * 100}%` }}
                        >
                          {month.values.map((value, index) => (
                            <div
                              key={channelNames[index]}
                              className="channels__seg"
                              style={{
                                flexGrow: value,
                                background: `var(--example-chart-${index + 1})`,
                              }}
                              title={`${channelNames[index]}: ${value}k sessions`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="channels__months">
                  {channelMonths.map((month) => (
                    <span key={month.month}>{month.month}</span>
                  ))}
                </div>
                <ul className="channels__legend">
                  {channelNames.map((name, index) => (
                    <li key={name}>
                      <i style={{ background: `var(--example-chart-${index + 1})` }} />
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            </TCard>

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
          </div>

          <aside className="board__side">
            <TCard
              variant="outline"
              size={config.density}
              header={<strong>New customer</strong>}
              footer={
                <div className="form-foot">
                  <TButton variant="soft" size="sm">
                    Save draft
                  </TButton>
                  <TButton size="sm" disabled={Boolean(emailError)}>
                    Create customer
                  </TButton>
                </div>
              }
            >
              <div className="form">
                <label className="form__field">
                  <span className="form__label">Name</span>
                  <TInput
                    size={config.density}
                    placeholder="Full name"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                  />
                  <span className="form__hint">Shown on invoices and receipts.</span>
                </label>

                <label className="form__field">
                  <span className="form__label">Email</span>
                  <TInput
                    type="email"
                    size={config.density}
                    placeholder="name@company.com"
                    invalid={Boolean(emailError)}
                    value={customerEmail}
                    onChange={(event) => setCustomerEmail(event.target.value)}
                  />
                  {emailError ? (
                    <span className="form__error" role="alert">
                      {emailError}
                    </span>
                  ) : null}
                </label>

                {/* Not yet in @treeui/react — mirrored from the Vue example
                    (examples/dashboard-vue/src/views/OverviewView.vue). Uncomment
                    as each component lands in packages/react:

                <TFormField label="Plan">
                  <TSelect
                    aria-label="Plan"
                    options={[
                      { label: 'Seed', value: 'seed' },
                      { label: 'Sapling', value: 'sapling' },
                      { label: 'Evergreen', value: 'evergreen' },
                    ]}
                  />
                </TFormField>

                <TCheckbox size="sm">Email me product updates</TCheckbox>

                <TSwitch size="sm">Enable notifications</TSwitch>

                <TRadioGroup name="billing" size="sm" aria-label="Billing period">
                  <TRadio value="monthly">Monthly billing</TRadio>
                  <TRadio value="yearly">Yearly billing</TRadio>
                </TRadioGroup>
                */}
              </div>
            </TCard>

            <TCard variant="outline" size={config.density} header={<strong>Alerts</strong>}>
              <p className="muted">
                TAlert is not in @treeui/react yet — the Vue example shows the live version.
              </p>
              {/* Mirrored from the Vue example; uncomment when TAlert lands:

              <TAlert variant="success" size="sm">Backup finished at 02:00.</TAlert>
              <TAlert variant="info" size="sm">Version 2.4 is available.</TAlert>
              <TAlert variant="warning" size="sm">Plan usage reached 80%.</TAlert>
              <TAlert variant="danger" size="sm" dismissible>Inventory sync failed.</TAlert>
              */}
            </TCard>

            <TCard variant="outline" size={config.density} header={<strong>Danger zone</strong>}>
              <p className="muted">Deleting the quarterly report removes it for every teammate.</p>
              <div>
                <TButton
                  variant="danger"
                  size="sm"
                  onClick={() => {
                  /* Swap for TConfirmDialog once it lands in @treeui/react:

                  <TConfirmDialog
                    title="Delete report?"
                    description="This action cannot be undone."
                    confirmLabel="Delete"
                    onConfirm={deleteReport}
                  >
                    <TButton variant="danger" size="sm">Delete report</TButton>
                  </TConfirmDialog>
                  */
                    window.confirm('Delete report? This action cannot be undone.');
                  }}
                >
                  Delete report
                </TButton>
              </div>
            </TCard>
          </aside>
        </div>
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
