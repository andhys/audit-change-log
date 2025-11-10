import React, { useState, useEffect } from 'react';

const AuditLog = () => {
  // State for user selection
  const [selectedUserId, setSelectedUserId] = useState('');
  const [searchString, setSearchString] = useState('');
  const [users, setUsers] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  // State for date selection
  const [selectedFromDate, setSelectedFromDate] = useState('');
  const [selectedToDate, setSelectedToDate] = useState('');
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  
  // State for audit data
  const [auditData, setAuditData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch users based on search string
  const searchUsers = async (search) => {
    if (!search || search.length < 2) {
      setUsers([]);
      return;
    }

    try {
      const response = await fetch('/api/User/SearchUserByPartialName', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: search }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
      setShowUserDropdown(true);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    }
  };

  // Debounce user search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchString);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchString]);

  // Fetch audit log data
  const fetchAuditData = async () => {
    if (!selectedUserId) {
      setAuditData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/AuditLog/SearchChangesForUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUserId,
          fromDate: selectedFromDate,
          toDate: selectedToDate,
          page: currentPage,
          pageSize: currentPageSize,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audit data');
      }

      const data = await response.json();
      setAuditData(data.items || data);
      
      // Calculate total pages if pagination info is provided
      if (data.totalCount) {
        setTotalPages(Math.ceil(data.totalCount / currentPageSize));
      }
    } catch (err) {
      console.error('Error fetching audit data:', err);
      setError(err.message);
      setAuditData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch audit data when dependencies change
  useEffect(() => {
    fetchAuditData();
  }, [selectedUserId, selectedFromDate, selectedToDate, currentPage, currentPageSize]);

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUserId(user.id);
    setSearchString(user.name || user.username || user.id);
    setShowUserDropdown(false);
    setCurrentPage(1); // Reset to first page when changing user
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    setCurrentPageSize(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Audit Log</h1>
      
      {/* Search and Filter Section */}
      <div style={styles.filterSection}>
        {/* User Search Field */}
        <div style={styles.filterGroup}>
          <label style={styles.label}>User:</label>
          <div style={styles.autocompleteContainer}>
            <input
              type="text"
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              onFocus={() => searchString && setShowUserDropdown(true)}
              placeholder="Search user by name..."
              style={styles.input}
            />
            {showUserDropdown && users.length > 0 && (
              <div style={styles.dropdown}>
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    style={styles.dropdownItem}
                  >
                    {user.name || user.username || user.id}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* From Date */}
        <div style={styles.filterGroup}>
          <label style={styles.label}>From Date:</label>
          <input
            type="date"
            value={selectedFromDate}
            onChange={(e) => setSelectedFromDate(e.target.value)}
            style={styles.input}
          />
        </div>

        {/* To Date */}
        <div style={styles.filterGroup}>
          <label style={styles.label}>To Date:</label>
          <input
            type="date"
            value={selectedToDate}
            onChange={(e) => setSelectedToDate(e.target.value)}
            style={styles.input}
          />
        </div>

        {/* Page Size Selector */}
        <div style={styles.filterGroup}>
          <label style={styles.label}>Page Size:</label>
          <select
            value={currentPageSize}
            onChange={handlePageSizeChange}
            style={styles.select}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.error}>
          Error: {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div style={styles.loading}>
          Loading audit data...
        </div>
      )}

      {/* Audit Data Table */}
      {!loading && auditData.length > 0 && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.tableHeader}>Timestamp</th>
                <th style={styles.tableHeader}>User</th>
                <th style={styles.tableHeader}>Action</th>
                <th style={styles.tableHeader}>Entity</th>
                <th style={styles.tableHeader}>Changes</th>
              </tr>
            </thead>
            <tbody>
              {auditData.map((item, index) => (
                <tr key={index} style={styles.tableRow}>
                  <td style={styles.tableCell}>
                    {item.timestamp ? new Date(item.timestamp).toLocaleString() : '-'}
                  </td>
                  <td style={styles.tableCell}>{item.user || item.userId || '-'}</td>
                  <td style={styles.tableCell}>{item.action || '-'}</td>
                  <td style={styles.tableCell}>{item.entity || item.entityType || '-'}</td>
                  <td style={styles.tableCell}>
                    {item.changes ? JSON.stringify(item.changes) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No Data Message */}
      {!loading && auditData.length === 0 && selectedUserId && (
        <div style={styles.noData}>
          No audit data found for the selected criteria.
        </div>
      )}

      {!selectedUserId && (
        <div style={styles.noData}>
          Please select a user to view audit data.
        </div>
      )}

      {/* Pagination Controls */}
      {auditData.length > 0 && (
        <div style={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={styles.paginationButton}
          >
            Previous
          </button>
          <span style={styles.paginationInfo}>
            Page {currentPage} {totalPages > 0 ? `of ${totalPages}` : ''}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={totalPages > 0 && currentPage >= totalPages}
            style={styles.paginationButton}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

// Inline styles
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#333',
  },
  filterSection: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '150px',
  },
  label: {
    marginBottom: '5px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#555',
  },
  input: {
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
  },
  select: {
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
  },
  autocompleteContainer: {
    position: 'relative',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderTop: 'none',
    borderRadius: '0 0 4px 4px',
    maxHeight: '200px',
    overflowY: 'auto',
    zIndex: 1000,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  dropdownItem: {
    padding: '10px',
    cursor: 'pointer',
    borderBottom: '1px solid #eee',
    ':hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  error: {
    padding: '10px',
    backgroundColor: '#fee',
    color: '#c33',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  loading: {
    padding: '20px',
    textAlign: 'center',
    color: '#666',
  },
  noData: {
    padding: '20px',
    textAlign: 'center',
    color: '#999',
  },
  tableContainer: {
    overflowX: 'auto',
    marginBottom: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
  },
  tableHeaderRow: {
    backgroundColor: '#f5f5f5',
  },
  tableHeader: {
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #ddd',
    fontWeight: 'bold',
    color: '#333',
  },
  tableRow: {
    borderBottom: '1px solid #eee',
  },
  tableCell: {
    padding: '12px',
    textAlign: 'left',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    marginTop: '20px',
  },
  paginationButton: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  paginationInfo: {
    fontSize: '14px',
    color: '#666',
  },
};

export default AuditLog;
