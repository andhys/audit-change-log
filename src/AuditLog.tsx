import React, { useState, useEffect, useCallback } from 'react';
import type { AuditLog, User } from './types';

const AuditLogComponent: React.FC = () => {
  // State for user selection
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchString, setSearchString] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);
  
  // State for date selection
  const [selectedFromDate, setSelectedFromDate] = useState<string>('');
  const [selectedToDate, setSelectedToDate] = useState<string>('');
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentPageSize, setCurrentPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  
  // State for audit data
  const [auditData, setAuditData] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch users based on search string
  const searchUsers = async (search: string): Promise<void> => {
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

      const data: User[] = await response.json();
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
  const fetchAuditData = useCallback(async (): Promise<void> => {
    if (!selectedUserId) {
      setAuditData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/AuditLog/GetAuditChangeLogsByUserId', {
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
      setError(err instanceof Error ? err.message : 'An error occurred');
      setAuditData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedUserId, selectedFromDate, selectedToDate, currentPage, currentPageSize]);

  // Fetch audit data when dependencies change
  useEffect(() => {
    fetchAuditData();
  }, [fetchAuditData]);

  // Handle user selection
  const handleUserSelect = (user: User): void => {
    setSelectedUserId(user.userId);
    setSearchString(user.fullName || user.userId.toString());
    setShowUserDropdown(false);
    setCurrentPage(1); // Reset to first page when changing user
  };

  // Handle page change
  const handlePageChange = (newPage: number): void => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setCurrentPageSize(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Handle dropdown item mouse enter
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Audit Log</h1>
      
      {/* Search and Filter Section */}
      <div style={styles.filterSection}>
        {/* User Search Field */}
        <div style={styles.filterGroup}>
          <label htmlFor="user-search" style={styles.label}>User:</label>
          <div style={styles.autocompleteContainer}>
            <input
              id="user-search"
              type="text"
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              onFocus={() => searchString && setShowUserDropdown(true)}
              placeholder="Search user by name..."
              style={styles.input}
              aria-label="Search for a user by name"
            />
            {showUserDropdown && users.length > 0 && (
              <div style={styles.dropdown}>
                {users.map((user) => (
                  <div
                    key={user.userId}
                    onClick={() => handleUserSelect(user)}
                    onMouseEnter={() => setHoveredItem(user.userId)}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{
                      ...styles.dropdownItem,
                      ...(hoveredItem === user.userId ? styles.dropdownItemHover : {})
                    }}
                  >
                    {user.fullName || user.userId}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* From Date */}
        <div style={styles.filterGroup}>
          <label htmlFor="from-date" style={styles.label}>From Date:</label>
          <input
            id="from-date"
            type="date"
            value={selectedFromDate}
            onChange={(e) => setSelectedFromDate(e.target.value)}
            style={styles.input}
          />
        </div>

        {/* To Date */}
        <div style={styles.filterGroup}>
          <label htmlFor="to-date" style={styles.label}>To Date:</label>
          <input
            id="to-date"
            type="date"
            value={selectedToDate}
            onChange={(e) => setSelectedToDate(e.target.value)}
            style={styles.input}
          />
        </div>

        {/* Page Size Selector */}
        <div style={styles.filterGroup}>
          <label htmlFor="page-size" style={styles.label}>Page Size:</label>
          <select
            id="page-size"
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
                <th style={styles.tableHeader}>Change Date</th>
                <th style={styles.tableHeader}>User Name</th>
                <th style={styles.tableHeader}>Change Type</th>
                <th style={styles.tableHeader}>Schema</th>
                <th style={styles.tableHeader}>Table</th>
                <th style={styles.tableHeader}>Key Value</th>
                <th style={styles.tableHeader}>Diff</th>
              </tr>
            </thead>
            <tbody>
              {auditData.map((item, index) => (
                <tr key={index} style={styles.tableRow}>
                  <td style={styles.tableCell}>
                    {item.changeDate ? new Date(item.changeDate).toLocaleString() : '-'}
                  </td>
                  <td style={styles.tableCell}>{item.userName || '-'}</td>
                  <td style={styles.tableCell}>{item.changeType || '-'}</td>
                  <td style={styles.tableCell}>{item.schemaName || '-'}</td>
                  <td style={styles.tableCell}>{item.tableName || '-'}</td>
                  <td style={styles.tableCell}>{item.keyValue || '-'}</td>
                  <td style={styles.tableCell}>
                    {item.diffText || item.diffJson || '-'}
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
const styles: { [key: string]: React.CSSProperties } = {
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
  },
  dropdownItemHover: {
    backgroundColor: '#f5f5f5',
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

export default AuditLogComponent;
