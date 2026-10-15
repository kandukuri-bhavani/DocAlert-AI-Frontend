import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import mammoth from "mammoth";
import DOMPurify from "dompurify";

const API = "http://localhost:8081";

function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [reminderLoading, setReminderLoading] = useState(true);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [activePage, setActivePage] = useState("overview");

  // Document preview state
  const [previewDocument, setPreviewDocument] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadDocuments();
    loadReminders();
    loadUnreadCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------
  // DOCUMENTS
  // -------------------------

  const loadDocuments = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      const response = await fetch(`${API}/api/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to load documents");
      }

      const data = await response.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Documents:", error);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // REMINDERS
  // -------------------------

  const loadReminders = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setReminderLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API}/api/reminders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to load reminders");
      }

      const data = await response.json();
      setReminders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Reminders:", error);
    } finally {
      setReminderLoading(false);
    }
  };

  // -------------------------
  // NOTIFICATION COUNT
  // -------------------------

  const loadUnreadCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `${API}/api/notifications/unread/count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) return;

      const data = await response.json();
      setUnreadCount(data.count ?? 0);
    } catch (error) {
      console.error("Notification count:", error);
    }
  };

  // -------------------------
  // NOTIFICATIONS
  // -------------------------

  const loadNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setNotificationLoading(true);

    try {
      const response = await fetch(`${API}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to load notifications");
      }

      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Notifications:", error);
    } finally {
      setNotificationLoading(false);
    }
  };

  const toggleNotifications = () => {
    const willOpen = !notificationOpen;

    setNotificationOpen(willOpen);
    setProfileOpen(false);

    if (willOpen) {
      loadNotifications();
    }
  };

  const markNotificationAsRead = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `${API}/api/notifications/${id}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) return;

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, read: true } : item
        )
      );

      setUnreadCount((previous) => Math.max(previous - 1, 0));
    } catch (error) {
      console.error("Mark notification as read:", error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `${API}/api/notifications/read-all`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) return;

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, read: true }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Mark all notifications as read:", error);
    }
  };

  // -------------------------
  // MENU AND PROFILE
  // -------------------------

  const toggleMenu = () => {
    setMenuOpen((previous) => !previous);
    setProfileOpen(false);
    setNotificationOpen(false);
  };

  const toggleProfile = () => {
    setProfileOpen((previous) => !previous);
    setNotificationOpen(false);
  };

  const selectPage = (page) => {
    setActivePage(page);
    setMenuOpen(false);
    setProfileOpen(false);
    setNotificationOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    navigate("/");
  };

  const getUserName = () => {
    const email = localStorage.getItem("email");
    return email ? email.split("@")[0] : "User";
  };

  // -------------------------
  // DELETE DOCUMENT
  // -------------------------

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const response = await fetch(`${API}/api/documents/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        alert("Unable to delete document.");
        return;
      }

      setDocuments((previous) =>
        previous.filter((doc) => doc.id !== id)
      );

      loadReminders();
    } catch (error) {
      console.error("Delete document:", error);
      alert("Unable to connect to the server.");
    }
  };

  // -------------------------
  // DOCUMENT PREVIEW
  // -------------------------

  const openDocumentPreview = (doc) => {
    setPreviewDocument(doc);
  };

  const closeDocumentPreview = () => {
    setPreviewDocument(null);
  };

  // -------------------------
  // DISPLAY HELPERS
  // -------------------------

  const getReminderClass = (days) => {
    if (days < 0) return "reminder-overdue";
    if (days === 0) return "reminder-danger";
    if (days <= 3) return "reminder-warning";
    return "reminder-normal";
  };

  const getReminderIcon = (type) => {
    if (type === "PAYMENT") return "₹";
    if (type === "EXPIRY") return "!";
    if (type === "MATURITY") return "⌁";
    return "•";
  };

  const getReminderStatus = (days) => {
    if (days == null) return "DATE UNAVAILABLE";

    if (days < 0) {
      const overdue = Math.abs(days);
      return `OVERDUE ${overdue} ${overdue === 1 ? "DAY" : "DAYS"}`;
    }

    if (days === 0) return "DUE TODAY";
    if (days === 1) return "1 DAY LEFT";

    return `${days} DAYS LEFT`;
  };

  const getCategoryIcon = (category) => {
    if (category === "Insurance") return "◇";
    if (category === "Fixed Deposit") return "∞";
    if (category === "Vehicle") return "□";
    return "▤";
  };

  const getNotificationIcon = (type) => {
    if (type === "PAYMENT") return "₹";
    if (type === "EXPIRY") return "!";
    if (type === "MATURITY") return "⌁";
    return "•";
  };

  const getFileLabel = (doc) => {
    const fileName = doc.originalFileName || "";
    const fileType = doc.fileType || "";

    if (fileName.includes(".")) {
      return fileName.split(".").pop().toUpperCase();
    }

    if (fileType.includes("pdf")) return "PDF";
    if (fileType.includes("wordprocessingml")) return "DOCX";
    if (fileType.includes("image/jpeg")) return "JPG";
    if (fileType.includes("image/png")) return "PNG";

    return "FILE";
  };

  // -------------------------
  // REUSABLE DOCUMENT CARD
  // -------------------------

  const renderDocumentCard = (doc) => (
    <div className="premium-document-card" key={doc.id}>
      <div className="document-card-top">
        <div className="document-file-icon">
          {getCategoryIcon(doc.category)}
        </div>

        <span className="category">
          {doc.category || "Uncategorized"}
        </span>
      </div>

      <h3>{doc.title || "Untitled document"}</h3>

      <div className="document-details">
        {doc.amount != null && (
          <div>
            <span>Amount</span>
            <strong>₹{doc.amount}</strong>
          </div>
        )}

        {doc.expiryDate && (
          <div>
            <span>Expiry</span>
            <strong>{doc.expiryDate}</strong>
          </div>
        )}

        {doc.maturityDate && (
          <div>
            <span>Maturity</span>
            <strong>{doc.maturityDate}</strong>
          </div>
        )}

        {doc.paymentDate && (
          <div>
            <span>Payment</span>
            <strong>{doc.paymentDate}</strong>
          </div>
        )}

        {doc.aiSummary && (
          <div className="document-summary">
            <span>AI Summary</span>
            <strong>{doc.aiSummary}</strong>
          </div>
        )}
      </div>

      <div className="document-actions">
        <button
          type="button"
          className="edit-button"
          onClick={() => openDocumentPreview(doc)}
        >
          Preview
        </button>

        <button
          type="button"
          className="edit-button"
          onClick={() => navigate(`/edit-document/${doc.id}`)}
        >
          Edit
        </button>

        <button
          type="button"
          className="delete-button"
          onClick={() => handleDelete(doc.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );

  // -------------------------
  // DASHBOARD UI
  // -------------------------

  return (
    <div className="dashboard-shell">
      {menuOpen && (
        <div
          className="menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`side-menu ${menuOpen ? "side-menu-open" : ""}`}
      >
        <div className="side-menu-brand">
          <div className="brand-mark">D</div>
          <div>
            <strong>DocAlert</strong>
            <span>AI</span>
          </div>
        </div>

        <div className="menu-label">WORKSPACE</div>

        <button
          className={`menu-item ${
            activePage === "overview" ? "active" : ""
          }`}
          onClick={() => selectPage("overview")}
        >
          <span>⌂</span>
          Overview
        </button>

        <button
          className={`menu-item ${
            activePage === "documents" ? "active" : ""
          }`}
          onClick={() => selectPage("documents")}
        >
          <span>▣</span>
          My Documents
        </button>

        <button
          className={`menu-item ${
            activePage === "reminders" ? "active" : ""
          }`}
          onClick={() => selectPage("reminders")}
        >
          <span>◷</span>
          Reminders
        </button>

        <button
          className="menu-item"
          onClick={() => {
            selectPage("overview");
            setNotificationOpen(true);
            loadNotifications();
          }}
        >
          <span>♢</span>
          Notifications
          {unreadCount > 0 && <small>{unreadCount}</small>}
        </button>

        <button
          className={`menu-item ${
            activePage === "insights" ? "active" : ""
          }`}
          onClick={() => selectPage("insights")}
        >
          <span>✦</span>
          AI Insights
        </button>

        <div className="menu-divider" />
        <div className="menu-label">ACCOUNT</div>

        <button
          className="menu-item"
          onClick={() => {
            setProfileOpen(true);
            setNotificationOpen(false);
          }}
        >
          <span>◎</span>
          Profile
        </button>

        <button
          className={`menu-item ${
            activePage === "settings" ? "active" : ""
          }`}
          onClick={() => selectPage("settings")}
        >
          <span>⚙</span>
          Settings
        </button>

        <button
          className={`menu-item ${
            activePage === "help" ? "active" : ""
          }`}
          onClick={() => selectPage("help")}
        >
          <span>?</span>
          Help
        </button>

        <div className="side-menu-bottom">
          <button
            className="menu-item logout-menu-item"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN APPLICATION */}
      <div className="dashboard">
        {/* HEADER */}
        <header className="premium-header">
          <div className="header-left">
            <button
              type="button"
              className="menu-toggle"
              onClick={toggleMenu}
              aria-label="Open navigation"
            >
              <span />
              <span />
              <span />
            </button>

            <div className="header-brand">
              <div className="header-logo">D</div>
              <div>
                <h1>
                  DocAlert <em>AI</em>
                </h1>
                <p>Your personal document archive</p>
              </div>
            </div>
          </div>

          <div className="header-right">
            {/* NOTIFICATIONS */}
            <div className="header-dropdown">
              <button
                type="button"
                className="icon-button"
                onClick={toggleNotifications}
                aria-label="Notifications"
              >
                ♢
                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="notification-panel">
                  <div className="notification-header">
                    <div>
                      <h3>Notifications</h3>
                      <span>
                        {unreadCount > 0
                          ? `${unreadCount} unread`
                          : "All caught up"}
                      </span>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        className="mark-all-button"
                        onClick={markAllNotificationsAsRead}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {notificationLoading ? (
                    <div className="notification-empty">
                      Loading...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="notification-empty">
                      <div className="notification-empty-icon">♢</div>
                      <h4>No notifications</h4>
                      <p>You're all caught up.</p>
                    </div>
                  ) : (
                    <div className="notification-list">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`notification-item ${
                            notification.read
                              ? "notification-read"
                              : "notification-unread"
                          }`}
                          onClick={() =>
                            !notification.read &&
                            markNotificationAsRead(notification.id)
                          }
                        >
                          <div className="notification-icon">
                            {getNotificationIcon(notification.type)}
                          </div>

                          <div className="notification-content">
                            <h4>{notification.title}</h4>
                            <p>{notification.message}</p>
                            <small>
                              {notification.createdAt
                                ? new Date(
                                    notification.createdAt
                                  ).toLocaleString()
                                : ""}
                            </small>
                          </div>

                          {!notification.read && (
                            <span className="unread-dot">●</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PROFILE */}
            <div className="header-dropdown">
              <button
                type="button"
                className="profile-trigger"
                onClick={toggleProfile}
              >
                <div className="profile-avatar">
                  {getUserName().charAt(0).toUpperCase()}
                </div>

                <div className="profile-name">
                  <strong>{getUserName()}</strong>
                  <span>Personal account</span>
                </div>

                <span className="profile-chevron">▾</span>
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <div className="large-avatar">
                      {getUserName().charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <strong>{getUserName()}</strong>
                      <span>Personal account</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setProfileOpen(false)}
                  >
                    ◎ My Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => selectPage("settings")}
                  >
                    ⚙ Account Settings
                  </button>

                  <button
                    type="button"
                    onClick={() => setProfileOpen(false)}
                  >
                    ◈ Security
                  </button>

                  <div className="profile-divider" />

                  <button
                    type="button"
                    className="profile-logout"
                    onClick={handleLogout}
                  >
                    ↪ Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="dashboard-content">
          {/* MY DOCUMENTS */}
          {activePage === "documents" ? (
            <section className="records-section">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">YOUR ARCHIVE</span>
                  <h2>My Documents</h2>
                  <p>All your saved documents in one place.</p>
                </div>

                <div className="hero-actions">
                  <button
                    type="button"
                    className="primary-action"
                    onClick={() => navigate("/add-document")}
                  >
                    + Add Document
                  </button>

                  <button
                    type="button"
                    className="upload-action"
                    onClick={() => navigate("/upload-document")}
                  >
                    ↑ Upload & Analyze
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="premium-empty">
                  Loading your documents...
                </div>
              ) : documents.length === 0 ? (
                <div className="archive-empty">
                  <div className="archive-empty-icon">+</div>
                  <h3>Your archive is empty</h3>
                  <p>
                    Upload your first important document to get started.
                  </p>

                  <button
                    type="button"
                    className="primary-action"
                    onClick={() => navigate("/upload-document")}
                  >
                    Upload Your First Document
                  </button>
                </div>
              ) : (
                <>
                  <p className="section-kicker">
                    {documents.length}{" "}
                    {documents.length === 1 ? "DOCUMENT" : "DOCUMENTS"} SAVED
                  </p>

                  <div className="records-grid">
                    {documents.map(renderDocumentCard)}
                  </div>
                </>
              )}
            </section>
          ) : activePage === "reminders" ? (
            /* REMINDERS PAGE */
            <section className="records-section">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">STAY PREPARED</span>
                  <h2>Reminders</h2>
                  <p>Upcoming payments, renewals and maturities.</p>
                </div>
              </div>

              {reminderLoading ? (
                <div className="premium-empty">Loading reminders...</div>
              ) : reminders.length === 0 ? (
                <div className="archive-empty">
                  <h3>No reminders yet</h3>
                  <p>Your upcoming reminders will appear here.</p>
                </div>
              ) : (
                <div className="reminders-list">
                  {reminders.map((reminder) => (
                    <div
                      className={`premium-reminder ${getReminderClass(
                        reminder.daysRemaining
                      )}`}
                      key={`${reminder.documentId}-${reminder.type}`}
                    >
                      <div className="reminder-symbol">
                        {getReminderIcon(reminder.type)}
                      </div>

                      <div className="reminder-main">
                        <div className="reminder-heading">
                          <h3>{reminder.title}</h3>
                          <span>{reminder.type}</span>
                        </div>

                        <p>{reminder.message}</p>
                        <small>Due {reminder.dueDate}</small>
                      </div>

                      <div className="reminder-status">
                        <strong>
                          {getReminderStatus(reminder.daysRemaining)}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : activePage === "insights" ? (
            /* AI INSIGHTS PAGE */
            <section className="ai-preview">
              <div className="ai-preview-mark">✦</div>

              <div className="ai-preview-content">
                <span>DOCALERT AI</span>
                <h2>Understand your documents better.</h2>
                <p>
                  Upload documents to identify important dates, payment
                  details, expiry information and key points.
                </p>
              </div>

              <button
                type="button"
                className="secondary-action"
                onClick={() => navigate("/upload-document")}
              >
                Upload & Analyze →
              </button>
            </section>
          ) : activePage === "settings" || activePage === "help" ? (
            /* SETTINGS / HELP */
            <section className="records-section">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">ACCOUNT</span>
                  <h2>
                    {activePage === "settings" ? "Settings" : "Help"}
                  </h2>
                </div>
              </div>

              <div className="archive-empty">
                <h3>
                  {activePage === "settings"
                    ? "Account settings"
                    : "How can we help?"}
                </h3>
                <p>
                  {activePage === "settings"
                    ? "More account preferences can be added here."
                    : "Upload a document to analyze it and review its important details."}
                </p>
              </div>
            </section>
          ) : (
            /* OVERVIEW PAGE */
            <>
              <section className="dashboard-hero">
                <div>
                  <div className="eyebrow">PERSONAL ARCHIVE</div>

                  <h2>
                    Good day, <span>{getUserName()}</span>.
                  </h2>

                  <p>
                    Everything important, organised, protected and never
                    forgotten.
                  </p>
                </div>

                <div className="hero-actions">
                  <button
                    type="button"
                    className="primary-action"
                    onClick={() => navigate("/add-document")}
                  >
                    <span>+</span> Add Document
                  </button>

                  <button
                    type="button"
                    className="upload-action"
                    onClick={() => navigate("/upload-document")}
                  >
                    <span>↑</span> Upload & Analyze
                  </button>
                </div>
              </section>

              {/* STATISTICS */}
              <section className="stats">
                <div className="stat-card stat-primary">
                  <div className="stat-icon">◫</div>
                  <div>
                    <span>Total Records</span>
                    <strong>{documents.length}</strong>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">◇</div>
                  <div>
                    <span>Insurance</span>
                    <strong>
                      {
                        documents.filter(
                          (doc) => doc.category === "Insurance"
                        ).length
                      }
                    </strong>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">∞</div>
                  <div>
                    <span>Fixed Deposits</span>
                    <strong>
                      {
                        documents.filter(
                          (doc) => doc.category === "Fixed Deposit"
                        ).length
                      }
                    </strong>
                  </div>
                </div>

                <div className="stat-card stat-alert">
                  <div className="stat-icon">!</div>
                  <div>
                    <span>Needs Attention</span>
                    <strong>{reminders.length}</strong>
                  </div>
                </div>
              </section>

              {/* ATTENTION REQUIRED */}
              <section className="attention-section">
                <div className="section-heading">
                  <div>
                    <span className="section-kicker">IMPORTANT</span>
                    <h2>Attention required</h2>
                  </div>

                  {reminders.length > 0 && (
                    <span className="section-count">
                      {reminders.length} alerts
                    </span>
                  )}
                </div>

                {reminderLoading ? (
                  <div className="premium-empty">
                    Checking your records...
                  </div>
                ) : reminders.length === 0 ? (
                  <div className="clear-state">
                    <div className="clear-icon">✓</div>
                    <div>
                      <h3>Everything is in order</h3>
                      <p>
                        No reminders are currently available to display.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="reminders-list">
                    {reminders.slice(0, 4).map((reminder) => (
                      <div
                        className={`premium-reminder ${getReminderClass(
                          reminder.daysRemaining
                        )}`}
                        key={`${reminder.documentId}-${reminder.type}`}
                      >
                        <div className="reminder-symbol">
                          {getReminderIcon(reminder.type)}
                        </div>

                        <div className="reminder-main">
                          <div className="reminder-heading">
                            <h3>{reminder.title}</h3>
                            <span>{reminder.type}</span>
                          </div>

                          <p>{reminder.message}</p>
                          <small>Due {reminder.dueDate}</small>
                        </div>

                        <div className="reminder-status">
                          <strong>
                            {getReminderStatus(reminder.daysRemaining)}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  className="text-action"
                  onClick={() => selectPage("reminders")}
                >
                  View all reminders →
                </button>
              </section>

              {/* RECENT DOCUMENTS */}
              <section className="records-section">
                <div className="section-heading">
                  <div>
                    <span className="section-kicker">YOUR ARCHIVE</span>
                    <h2>Recent documents</h2>
                  </div>

                  <button
                    type="button"
                    className="text-action"
                    onClick={() => selectPage("documents")}
                  >
                    View all →
                  </button>
                </div>

                {loading ? (
                  <div className="premium-empty">
                    Loading your archive...
                  </div>
                ) : documents.length === 0 ? (
                  <div className="archive-empty">
                    <div className="archive-empty-icon">+</div>
                    <h3>Your archive is empty</h3>
                    <p>
                      Add your first important document to get started.
                    </p>

                    <button
                      type="button"
                      className="primary-action"
                      onClick={() => navigate("/upload-document")}
                    >
                      Upload First Document
                    </button>
                  </div>
                ) : (
                  <div className="records-grid">
                    {documents.slice(0, 6).map(renderDocumentCard)}
                  </div>
                )}
              </section>

              {/* AI PREVIEW */}
              <section className="ai-preview">
                <div className="ai-preview-mark">✦</div>

                <div className="ai-preview-content">
                  <span>DOCALERT AI</span>
                  <h2>Let your documents explain themselves.</h2>
                  <p>
                    Upload a PDF, DOCX or photo. DocAlert AI can identify
                    document details, summarize the content and highlight
                    important dates.
                  </p>
                </div>

                <button
                  type="button"
                  className="secondary-action"
                  onClick={() => navigate("/upload-document")}
                >
                  Explore AI →
                </button>
              </section>
            </>
          )}
        </main>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDocument && (
        <AuthenticatedDocumentPreview
          document={previewDocument}
          onClose={closeDocumentPreview}
        />
      )}
    </div>
  );
}

// -------------------------
// AUTHENTICATED DOCUMENT PREVIEW
// -------------------------

function AuthenticatedDocumentPreview({ document, onClose }) {
  const [fileUrl, setFileUrl] = useState("");
  const [contentType, setContentType] = useState(
    document.fileType || ""
  );
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState("");
  const [docxHtml, setDocxHtml] = useState("");

  const fileName =
    document.originalFileName ||
    document.title ||
    "document";

  useEffect(() => {
    let objectUrl = "";

    const loadPreview = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setPreviewError("Your session has expired. Please log in again.");
        setPreviewLoading(false);
        return;
      }

      try {
        /*
         * This endpoint must exist in your Spring Boot backend:
         * GET /api/documents/{id}/preview
         */
        const response = await fetch(
          `${API}/api/documents/${document.id}/preview`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "The original file could not be found."
              : "Unable to preview this document."
          );
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);

        if (fileName.toLowerCase().endsWith(".docx")) {
          const arrayBuffer = await blob.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setDocxHtml(result.value);
        }

        setContentType(
          response.headers.get("Content-Type") ||
            document.fileType ||
            blob.type ||
            ""
        );

        setFileUrl(objectUrl);
      } catch (error) {
        console.error("Document preview:", error);
        setPreviewError(error.message || "Unable to preview this document.");
      } finally {
        setPreviewLoading(false);
      }
    };

    loadPreview();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [document.id, document.fileType, fileName]);

  const isPdf =
    contentType.toLowerCase().includes("pdf") ||
    fileName.toLowerCase().endsWith(".pdf");

  const isImage =
    contentType.toLowerCase().startsWith("image/") ||
    /\.(png|jpe?g|gif|webp)$/i.test(fileName);

  return (
    <div
      className="document-preview-overlay"
      onClick={onClose}
      role="presentation"
    >
      <section
        className="document-preview-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Preview ${fileName}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="document-preview-header">
          <div>
            <span className="section-kicker">DOCUMENT PREVIEW</span>
            <h2>{document.title || fileName}</h2>
            <p>{fileName}</p>
          </div>

          <button
            type="button"
            className="document-preview-close"
            onClick={onClose}
            aria-label="Close preview"
          >
            ×
          </button>
        </div>

        <div className="document-preview-body">
          {previewLoading ? (
            <div className="premium-empty">
              Loading your document...
            </div>
          ) : previewError ? (
            <div className="archive-empty">
              <h3>Preview unavailable</h3>
              <p>{previewError}</p>
            </div>
          ) : isPdf ? (
            <iframe
              src={fileUrl}
              title={`Preview of ${fileName}`}
              className="document-preview-frame"
            />
          ) : isImage ? (
            <img
              src={fileUrl}
              alt={fileName}
              className="document-preview-image"
            />
          ) : fileName.toLowerCase().endsWith(".docx") ? (
            <div
              className="docx-preview-content"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(docxHtml),
              }}
            />
          ) : (
            <div className="archive-empty">
              <div className="archive-empty-icon">▤</div>
              <h3>This file cannot be previewed here</h3>
              <p>
                You can download the original document and open it on your
                device.
              </p>
            </div>
          )}
        </div>

        <div className="document-preview-footer">
          {fileUrl && (
            <a
              href={fileUrl}
              download={fileName}
              className="primary-action"
            >
              Download Document
            </a>
          )}

          <button
            type="button"
            className="secondary-action"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
