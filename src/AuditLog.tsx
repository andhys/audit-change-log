import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Autocomplete,
  Stack,
  Pagination,
  SelectChangeEvent,
} from '@mui/material';
import type { AuditLog, User } from './types';

const AuditLogComponent: React.FC = () => {
  // State for user selection
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchString, setSearchString] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  
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
  const handleUserSelect = (_event: React.SyntheticEvent, value: User | null): void => {
    if (value) {
      setSelectedUserId(value.userId);
      setCurrentPage(1); // Reset to first page when changing user
    } else {
      setSelectedUserId(null);
    }
  };

  // Handle page change
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number): void => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (event: SelectChangeEvent<number>): void => {
    setCurrentPageSize(Number(event.target.value));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Audit Log
      </Typography>
      
      {/* Search and Filter Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-end">
          {/* User Search Field */}
          <Autocomplete
            sx={{ minWidth: 250 }}
            options={users}
            getOptionLabel={(option) => option.fullName}
            onChange={handleUserSelect}
            onInputChange={(_event, value) => setSearchString(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="User"
                placeholder="Search user by name..."
                variant="outlined"
              />
            )}
            noOptionsText={searchString.length < 2 ? "Type at least 2 characters" : "No users found"}
          />

          {/* From Date */}
          <TextField
            label="From Date"
            type="date"
            value={selectedFromDate}
            onChange={(e) => setSelectedFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 200 }}
          />

          {/* To Date */}
          <TextField
            label="To Date"
            type="date"
            value={selectedToDate}
            onChange={(e) => setSelectedToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 200 }}
          />

          {/* Page Size Selector */}
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Page Size</InputLabel>
            <Select
              value={currentPageSize}
              label="Page Size"
              onChange={handlePageSizeChange}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
      )}

      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Audit Data Table */}
      {!loading && auditData.length > 0 && (
        <>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Change Date</strong></TableCell>
                  <TableCell><strong>User Name</strong></TableCell>
                  <TableCell><strong>Change Type</strong></TableCell>
                  <TableCell><strong>Schema</strong></TableCell>
                  <TableCell><strong>Table</strong></TableCell>
                  <TableCell><strong>Key Value</strong></TableCell>
                  <TableCell><strong>Diff</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditData.map((item, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      {item.changeDate ? new Date(item.changeDate).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>{item.userName || '-'}</TableCell>
                    <TableCell>{item.changeType || '-'}</TableCell>
                    <TableCell>{item.schemaName || '-'}</TableCell>
                    <TableCell>{item.tableName || '-'}</TableCell>
                    <TableCell>{item.keyValue || '-'}</TableCell>
                    <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.diffText || item.diffJson || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Controls */}
          {totalPages > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* No Data Message */}
      {!loading && auditData.length === 0 && selectedUserId && (
        <Alert severity="info">
          No audit data found for the selected criteria.
        </Alert>
      )}

      {!selectedUserId && (
        <Alert severity="info">
          Please select a user to view audit data.
        </Alert>
      )}
    </Container>
  );
};

export default AuditLogComponent;
