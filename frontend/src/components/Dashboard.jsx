import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  HardDrive,
  ShieldCheck,
  User,
  LogOut,
  Layers,
  ShoppingCart,
  CheckSquare,
  Square,
  Trash2,
  CheckCircle,
  Clock,
  PlusCircle,
  Cpu,
  Activity,
  Box,
  Globe,
  Mail,
  Link as LinkIcon,
  ArrowLeft,
  ArrowRight,
  XCircle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import NayatelLogo from './NayatelLogo';
import {
  getCurrentUser,
  logoutUser,
  fetchCloudServices,
  fetchUserSubscriptions,
  checkoutSubscriptions,
  cancelSubscription,
} from '../services/api';
import { useInactivityTimeout, DEFAULT_TIMEOUT_MINUTES } from '../hooks/useInactivityTimeout';

// Master category definitions matching the official Nayatel Cloud website
const MAIN_SERVICES_CONFIG = [
  {
    categoryKey: 'IAAS',
    title: 'IAAS',
    tagline: 'Launch virtual servers, enabling flexible scaling and cost saving by eliminating hardware management.',
    actionLabel: 'See Details',
    icon: Server,
    colorClass: 'iaas',
  },
  {
    categoryKey: 'CUBES',
    title: 'CUBES',
    tagline: 'Fast, containerized apps. Scale easily for your startups. 50% faster deployment and 30% cheaper costs.',
    actionLabel: 'See Details',
    icon: Box,
    colorClass: 'cubes',
  },
  {
    categoryKey: 'DB as a Service',
    title: 'DB as a Service',
    tagline: 'Fully managed PostgreSQL DB cluster with enterprise-grade high availability.',
    actionLabel: 'Create Cluster',
    icon: Database,
    colorClass: 'dbaas',
  },
  {
    categoryKey: 'Cloud Storage',
    title: 'Cloud Storage',
    tagline: 'Locally hosted S3-compatible encrypted object storage and enterprise backup.',
    actionLabel: 'See Details',
    icon: HardDrive,
    colorClass: 'storage',
  },
  {
    categoryKey: 'WEB-HOSTING',
    title: 'WEB-HOSTING',
    tagline: 'Fast website hosting with SSL. Project your business to a global audience.',
    actionLabel: 'See Details',
    icon: Globe,
    colorClass: 'hosting',
  },
  {
    categoryKey: 'NMAIL',
    title: 'NMAIL',
    tagline: 'Secure business emails. Get yourname@yourbusiness.com and sound more credible & professional.',
    actionLabel: 'See Details',
    icon: Mail,
    colorClass: 'nmail',
  },
  {
    categoryKey: 'DOMAIN',
    title: 'DOMAIN',
    tagline: 'Claim your unique online identity. Register domain names that build trust and make your brand stand out.',
    actionLabel: 'See Details',
    icon: LinkIcon,
    colorClass: 'domain',
  },
];

export default function Dashboard({ user, onLogout }) {
  const [currentUser, setCurrentUser] = useState(user);
  const [activeTab, setActiveTab] = useState('catalog'); // 'overview' | 'catalog' | 'cart' | 'subscriptions'
  const [selectedCategory, setSelectedCategory] = useState(null); // When null -> shows main boxes. When set -> shows options!

  // Data states
  const [services, setServices] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCartIds, setSelectedCartIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);

  // Inactivity timeout handler
  const handleSessionTimeout = () => {
    // Invalidate local storage and auth session
    logoutUser();
    setShowTimeoutModal(true);
  };

  const {
    timeoutMinutes,
    formattedTime,
    isWarningActive,
    resetTimer,
    changeTimeoutDuration,
  } = useInactivityTimeout(handleSessionTimeout, DEFAULT_TIMEOUT_MINUTES);

  // Load user profile, services, and subscriptions on mount
  const loadData = async () => {
    setLoading(true);
    try {
      const [userData, servicesData, subsData] = await Promise.all([
        getCurrentUser(),
        fetchCloudServices(),
        fetchUserSubscriptions(),
      ]);

      if (userData?.user) setCurrentUser(userData.user);
      if (Array.isArray(servicesData)) setServices(servicesData);
      if (Array.isArray(subsData)) setSubscriptions(subsData);
    } catch (err) {
      console.warn('Dashboard load warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Add a service to cart
  const handleAddToCart = (service) => {
    resetTimer();
    if (!cart.some((item) => item.id === service.id)) {
      setCart((prev) => [...prev, service]);
      setSelectedCartIds((prev) => new Set([...prev, service.id]));
      setActionMessage(`Added "${service.name}" to cart!`);
      setTimeout(() => setActionMessage(null), 3500);
    } else {
      setActionMessage(`"${service.name}" is already in your cart.`);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  // Toggle item selection in checkout
  const toggleSelectCartItem = (serviceId) => {
    resetTimer();
    setSelectedCartIds((prev) => {
      const next = new Set(prev);
      if (next.has(serviceId)) next.delete(serviceId);
      else next.add(serviceId);
      return next;
    });
  };

  // Remove/cross-off an item from cart
  const handleRemoveFromCart = (serviceId) => {
    resetTimer();
    setCart((prev) => prev.filter((item) => item.id !== serviceId));
    setSelectedCartIds((prev) => {
      const next = new Set(prev);
      next.delete(serviceId);
      return next;
    });
  };

  // Checkout and subscribe selected services
  const handleCheckout = async () => {
    resetTimer();
    const idsToSubscribe = Array.from(selectedCartIds);
    if (idsToSubscribe.length === 0) {
      alert('Please check at least one service to complete subscription.');
      return;
    }

    setLoading(true);
    try {
      await checkoutSubscriptions(idsToSubscribe, 'Subscribed via Nayatel Cloud Portal');
      setCart((prev) => prev.filter((item) => !selectedCartIds.has(item.id)));
      setSelectedCartIds(new Set());
      const updatedSubs = await fetchUserSubscriptions();
      setSubscriptions(updatedSubs);
      setActionMessage(`Successfully subscribed to ${idsToSubscribe.length} service(s)!`);
      setActiveTab('subscriptions');
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to complete subscription.');
    } finally {
      setLoading(false);
    }
  };

  // Cancel / Cross-off an active subscription from database
  const handleCancelSubscription = async (subId, serviceName) => {
    resetTimer();
    if (!window.confirm(`Are you sure you want to cancel subscription for "${serviceName}"?`)) {
      return;
    }

    try {
      await cancelSubscription(subId);
      const updatedSubs = await fetchUserSubscriptions();
      setSubscriptions(updatedSubs);
      setActionMessage(`Cancelled subscription for "${serviceName}".`);
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err) {
      alert(err.message || 'Failed to cancel subscription.');
    }
  };

  const selectedCartTotal = cart
    .filter((item) => selectedCartIds.has(item.id))
    .reduce((sum, item) => sum + parseFloat(item.price_pkr || 0), 0);

  const handleLogout = async () => {
    await logoutUser();
    onLogout();
  };

  // Filter services by selected category
  const filteredOptions = selectedCategory
    ? services.filter((s) => s.category === selectedCategory)
    : [];

  return (
    <div className="dashboard-container">
      {/* Session Expired Inactivity Modal */}
      {showTimeoutModal && (
        <div className="timeout-modal-overlay">
          <div className="timeout-modal-card">
            <div className="timeout-icon-wrapper">
              <Clock size={40} className="timeout-icon" />
            </div>
            <h2>Session Inactivity Timeout</h2>
            <p>
              You have been inactive for over{' '}
              <strong>
                {timeoutMinutes < 1
                  ? `${Math.round(timeoutMinutes * 60)} seconds`
                  : `${timeoutMinutes} minute(s)`}
              </strong>.
              For account security, your Nayatel Cloud session has expired.
            </p>
            <button
              type="button"
              className="submit-button"
              onClick={handleLogout}
            >
              Return to Login
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <NayatelLogo size="small" />
          <span className="header-badge">Cloud Portal</span>
        </div>

        <div className="dashboard-header-right">
          {/* Live Inactivity Timeout Demo Bar */}
          <div className={`timeout-pill ${isWarningActive ? 'warning' : ''}`} title="Session timeout indicator">
            <Clock size={15} />
            <span>Timeout: <strong>{formattedTime}</strong></span>
            
            {/* Quick switcher for supervisor demo */}
            <select
              className="timeout-select"
              value={timeoutMinutes}
              onChange={(e) => changeTimeoutDuration(parseFloat(e.target.value))}
              title="Supervisor Demo: Change timeout duration"
            >
              <option value={0.166}>10s (Test Now)</option>
              <option value={0.5}>30s (Demo)</option>
              <option value={2}>2 mins (Default)</option>
              <option value={5}>5 mins (Extended)</option>
            </select>
          </div>

          <div className="backend-status-pill">
            <span className="status-dot" />
            <span>Django REST Active</span>
          </div>

          <div className="user-profile-badge">
            <div className="avatar-circle">
              <User size={16} />
            </div>
            <div className="user-info-text">
              <span className="user-name">{currentUser?.profile?.full_name || currentUser?.username || 'User'}</span>
              <span className="user-email">{currentUser?.email || 'user@nayatel.com'}</span>
            </div>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
            title="Log out of session"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Layout: Sidebar Navigation + Content Area */}
      <div className="portal-layout">
        {/* Left Side Navigation Panel */}
        <aside className="portal-sidebar">
          <div className="sidebar-section-title">Navigation</div>
          <nav className="sidebar-nav">
            <button
              type="button"
              className={`sidebar-link ${activeTab === 'catalog' ? 'active' : ''}`}
              onClick={() => { setActiveTab('catalog'); resetTimer(); }}
            >
              <Layers size={18} />
              <span>Services Catalog</span>
              <span className="sidebar-count">{MAIN_SERVICES_CONFIG.length}</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === 'cart' ? 'active' : ''}`}
              onClick={() => { setActiveTab('cart'); resetTimer(); }}
            >
              <ShoppingCart size={18} />
              <span>Checkout & Cart</span>
              {cart.length > 0 && <span className="sidebar-badge">{cart.length}</span>}
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === 'subscriptions' ? 'active' : ''}`}
              onClick={() => { setActiveTab('subscriptions'); resetTimer(); }}
            >
              <CheckCircle size={18} />
              <span>My Subscriptions</span>
              <span className="sidebar-count">{subscriptions.filter(s => s.status === 'active').length}</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => { setActiveTab('overview'); resetTimer(); }}
            >
              <Activity size={18} />
              <span>Console Overview</span>
            </button>
          </nav>

          {/* Quick User Summary Box */}
          <div className="sidebar-user-box">
            <span className="user-box-label">Customer ID</span>
            <span className="user-box-val">NC-USR-00{currentUser?.id || '1'}</span>
            <span className="user-box-label">Account Type</span>
            <span className="user-box-val">{currentUser?.profile?.company || 'Individual Account'}</span>
            {currentUser?.profile?.phone && (
              <>
                <span className="user-box-label">Phone</span>
                <span className="user-box-val">{currentUser?.profile?.phone}</span>
              </>
            )}
          </div>
        </aside>

        {/* Content Area */}
        <main className="portal-main-content">
          {/* Action Notification Banner */}
          {actionMessage && (
            <div className="action-notification-toast">
              <CheckCircle size={18} />
              <span>{actionMessage}</span>
            </div>
          )}

          {/* TAB 1: CLOUD SERVICES CATALOG */}
          {activeTab === 'catalog' && (
            <div className="tab-container">
              {/* If NO category is selected, show the 7 Main Clickable Service Boxes */}
              {!selectedCategory ? (
                <>
                  <div className="tab-header">
                    <div>
                      <h1 className="tab-title">Nayatel Cloud Services</h1>
                      <p className="tab-subtitle">
                        Select any of our core enterprise cloud services below to configure plans, tiers, and pricing.
                      </p>
                    </div>
                    {cart.length > 0 && (
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => { setActiveTab('cart'); resetTimer(); }}
                      >
                        <ShoppingCart size={16} />
                        <span>View Cart ({cart.length})</span>
                      </button>
                    )}
                  </div>

                  {/* 7 Main Clickable Boxes */}
                  <div className="main-services-grid">
                    {MAIN_SERVICES_CONFIG.map((config) => {
                      const IconComponent = config.icon;
                      const optionsCount = services.filter((s) => s.category === config.categoryKey).length;

                      return (
                        <div
                          key={config.categoryKey}
                          className={`main-service-card ${config.colorClass}`}
                          onClick={() => {
                            setSelectedCategory(config.categoryKey);
                            resetTimer();
                          }}
                        >
                          <div className="card-top-row">
                            <div className="main-service-icon-box">
                              <IconComponent size={28} />
                            </div>
                            <span className="options-badge">{optionsCount} Plans Available</span>
                          </div>

                          <h2 className="main-service-title">{config.title}</h2>
                          <p className="main-service-tagline">{config.tagline}</p>

                          <div className="main-service-action-row">
                            <button
                              type="button"
                              className="see-details-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCategory(config.categoryKey);
                                resetTimer();
                              }}
                            >
                              <span>{config.actionLabel}</span>
                              <ChevronRight size={18} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* Sub-options View (Drill-down when a Main Box is clicked) */
                <>
                  <div className="drilldown-header">
                    <button
                      type="button"
                      className="back-to-catalog-btn"
                      onClick={() => {
                        setSelectedCategory(null);
                        resetTimer();
                      }}
                    >
                      <ArrowLeft size={16} />
                      <span>Back to All Services</span>
                    </button>

                    <div className="drilldown-title-row">
                      <div className="drilldown-title-group">
                        <h1 className="tab-title">{selectedCategory} Available Plans</h1>
                        <p className="tab-subtitle">
                          {MAIN_SERVICES_CONFIG.find((c) => c.categoryKey === selectedCategory)?.tagline}
                        </p>
                      </div>

                      {cart.length > 0 && (
                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={() => { setActiveTab('cart'); resetTimer(); }}
                        >
                          <ShoppingCart size={16} />
                          <span>View Cart ({cart.length})</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Specific Service Options Grid */}
                  <div className="services-catalog-grid">
                    {filteredOptions.map((service) => {
                      const isInCart = cart.some((c) => c.id === service.id);
                      const isSubscribed = subscriptions.some(
                        (s) => s.service?.id === service.id && s.status === 'active'
                      );

                      return (
                        <div key={service.id} className="catalog-card option-card">
                          <div className="catalog-card-header">
                            <span className="category-tag compute">
                              {service.billing_cycle}
                            </span>
                            <div className="price-tag">
                              <span className="currency">PKR</span>
                              <span className="amount">{parseFloat(service.price_pkr).toLocaleString()}</span>
                              <span className="cycle">/mo</span>
                            </div>
                          </div>

                          <h3 className="catalog-card-title">{service.name}</h3>
                          <p className="catalog-card-specs">
                            <Cpu size={14} />
                            <span>{service.specs}</span>
                          </p>
                          <p className="catalog-card-desc">{service.description}</p>

                          <div className="catalog-card-footer">
                            {isSubscribed ? (
                              <span className="status-badge-active">
                                <CheckCircle size={14} />
                                <span>Currently Active</span>
                              </span>
                            ) : isInCart ? (
                              <button
                                type="button"
                                className="catalog-btn in-cart"
                                onClick={() => { setActiveTab('cart'); resetTimer(); }}
                              >
                                <span>In Cart - View Checkout</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="catalog-btn primary"
                                onClick={() => handleAddToCart(service)}
                              >
                                <PlusCircle size={16} />
                                <span>Add to Cart</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: CHECKOUT & CART */}
          {activeTab === 'cart' && (
            <div className="tab-container">
              <div className="tab-header">
                <div>
                  <h1 className="tab-title">Checkout & Service Review</h1>
                  <p className="tab-subtitle">
                    Select and cross-off items before deploying your Nayatel Cloud instances.
                  </p>
                </div>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => { setActiveTab('catalog'); resetTimer(); }}
                >
                  <PlusCircle size={16} />
                  <span>Browse More Services</span>
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="empty-cart-state">
                  <ShoppingCart size={48} className="empty-icon" />
                  <h3>Your Checkout Cart is Empty</h3>
                  <p>Browse our Cloud Services Catalog to select compute, storage, or security packages.</p>
                  <button
                    type="button"
                    className="submit-button"
                    style={{ maxWidth: '240px', marginTop: '16px' }}
                    onClick={() => { setActiveTab('catalog'); resetTimer(); }}
                  >
                    Explore Catalog
                  </button>
                </div>
              ) : (
                <div className="checkout-layout">
                  {/* Cart Table */}
                  <div className="checkout-table-wrapper">
                    <table className="checkout-table">
                      <thead>
                        <tr>
                          <th style={{ width: '40px' }}>Select</th>
                          <th>Service & Specifications</th>
                          <th>Category</th>
                          <th>Monthly Price</th>
                          <th style={{ width: '80px', textAlign: 'center' }}>Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((item) => {
                          const isChecked = selectedCartIds.has(item.id);

                          return (
                            <tr key={item.id} className={!isChecked ? 'row-crossed-off' : ''}>
                              <td>
                                <button
                                  type="button"
                                  className="checkbox-btn"
                                  onClick={() => toggleSelectCartItem(item.id)}
                                >
                                  {isChecked ? (
                                    <CheckSquare size={20} className="check-icon-active" />
                                  ) : (
                                    <Square size={20} className="check-icon-inactive" />
                                  )}
                                </button>
                              </td>
                              <td>
                                <div className="table-item-name">{item.name}</div>
                                <div className="table-item-specs">{item.specs}</div>
                              </td>
                              <td>
                                <span className="category-tag compute">
                                  {item.category}
                                </span>
                              </td>
                              <td className="table-price-cell">
                                PKR {parseFloat(item.price_pkr).toLocaleString()} /mo
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  type="button"
                                  className="remove-cart-btn"
                                  onClick={() => handleRemoveFromCart(item.id)}
                                  title="Remove item"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Order Summary Card */}
                  <div className="order-summary-card">
                    <h3 className="summary-title">Subscription Summary</h3>
                    <div className="summary-rows">
                      <div className="summary-row">
                        <span>Items in Cart</span>
                        <span>{cart.length}</span>
                      </div>
                      <div className="summary-row">
                        <span>Selected to Deploy</span>
                        <span>{selectedCartIds.size}</span>
                      </div>
                      <div className="summary-row">
                        <span>Billing Cycle</span>
                        <span>Monthly Recurring</span>
                      </div>
                      <div className="summary-divider" />
                      <div className="summary-total-row">
                        <span>Total Monthly:</span>
                        <span className="total-amount">PKR {selectedCartTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="submit-button"
                      disabled={loading || selectedCartIds.size === 0}
                      onClick={handleCheckout}
                    >
                      {loading ? 'Processing Subscription...' : `Subscribe & Deploy (${selectedCartIds.size})`}
                    </button>
                    <p className="summary-legal">
                      Charges will be billed to your Nayatel customer account monthly.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MY SUBSCRIPTIONS */}
          {activeTab === 'subscriptions' && (
            <div className="tab-container">
              <div className="tab-header">
                <div>
                  <h1 className="tab-title">My Cloud Subscriptions</h1>
                  <p className="tab-subtitle">
                    Live record of all cloud services applied to or subscribed by <strong>{currentUser?.username}</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => { setActiveTab('catalog'); resetTimer(); }}
                >
                  <PlusCircle size={16} />
                  <span>Subscribe to New Service</span>
                </button>
              </div>

              {subscriptions.length === 0 ? (
                <div className="empty-cart-state">
                  <Box size={48} className="empty-icon" />
                  <h3>No Active Subscriptions Found</h3>
                  <p>You have not applied for any Nayatel Cloud services yet.</p>
                  <button
                    type="button"
                    className="submit-button"
                    style={{ maxWidth: '240px', marginTop: '16px' }}
                    onClick={() => { setActiveTab('catalog'); resetTimer(); }}
                  >
                    View Services Catalog
                  </button>
                </div>
              ) : (
                <div className="subscriptions-table-wrapper">
                  <table className="subscriptions-table">
                    <thead>
                      <tr>
                        <th>Subscription ID</th>
                        <th>Cloud Service</th>
                        <th>Category</th>
                        <th>Specifications</th>
                        <th>Price (PKR)</th>
                        <th>Status</th>
                        <th>Applied Date</th>
                        <th style={{ textAlign: 'center' }}>Manage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.map((sub) => (
                        <tr key={sub.id} className={sub.status === 'cancelled' ? 'row-cancelled' : ''}>
                          <td>
                            <code>NC-SUB-{sub.id.toString().padStart(4, '0')}</code>
                          </td>
                          <td>
                            <strong>{sub.service?.name}</strong>
                          </td>
                          <td>
                            <span className="category-tag compute">
                              {sub.service?.category}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                            {sub.service?.specs}
                          </td>
                          <td className="table-price-cell">
                            PKR {parseFloat(sub.service?.price_pkr || 0).toLocaleString()}
                          </td>
                          <td>
                            <span className={`status-pill ${sub.status}`}>
                              {sub.status === 'active' ? 'Active' : sub.status === 'pending' ? 'Pending' : 'Cancelled'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                            {new Date(sub.subscribed_at).toLocaleDateString()}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {sub.status !== 'cancelled' ? (
                              <button
                                type="button"
                                className="cancel-sub-btn"
                                onClick={() => handleCancelSubscription(sub.id, sub.service?.name)}
                                title="Cancel / Cross-off subscription"
                              >
                                <XCircle size={15} />
                                <span>Cancel</span>
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.78rem', color: '#ef4444' }}>Decommissioned</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CONSOLE OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="tab-container">
              <section className="welcome-banner">
                <div className="welcome-content">
                  <h1 className="welcome-title">
                    Welcome back, <span>{currentUser?.profile?.full_name || currentUser?.username}</span>!
                  </h1>
                  <p className="welcome-sub">
                    Your Nayatel Cloud infrastructure is operational. Connected to TIA-942 Rated-3 Data Center in Islamabad.
                  </p>
                </div>
                <div className="banner-stats">
                  <div className="stat-item">
                    <span className="stat-label">Active Subscriptions</span>
                    <span className="stat-value">{subscriptions.filter(s => s.status === 'active').length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Platform Uptime</span>
                    <span className="stat-value">99.99%</span>
                  </div>
                </div>
              </section>

              {/* Quick Infrastructure Cards */}
              <div className="services-grid" style={{ marginTop: '24px' }}>
                <div className="service-card">
                  <div className="service-icon-wrapper blue">
                    <Server size={24} />
                  </div>
                  <div className="service-content">
                    <h3>IAAS Compute Fleet</h3>
                    <p className="service-subtext">Dedicated vCPUs, isolated RAM, and ultra-fast NVMe storage.</p>
                  </div>
                </div>

                <div className="service-card">
                  <div className="service-icon-wrapper cyan">
                    <HardDrive size={24} />
                  </div>
                  <div className="service-content">
                    <h3>S3 Object Storage</h3>
                    <p className="service-subtext">AES-256 encrypted unstructured storage with domestic compliance.</p>
                  </div>
                </div>

                <div className="service-card">
                  <div className="service-icon-wrapper purple">
                    <Database size={24} />
                  </div>
                  <div className="service-content">
                    <h3>Managed DBaaS</h3>
                    <p className="service-subtext">High availability PostgreSQL and MySQL with automated snapshots.</p>
                  </div>
                </div>

                <div className="service-card">
                  <div className="service-icon-wrapper green">
                    <ShieldCheck size={24} />
                  </div>
                  <div className="service-content">
                    <h3>Threat Shield</h3>
                    <p className="service-subtext">Layer 3/4/7 threat mitigation powered by local scrubbing centers.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
