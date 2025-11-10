# AuditLog Component - Visual Structure

## Component Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Audit Log                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐  │
│  │ User:        │ │ From Date:   │ │ To Date:     │ │ Page Size│  │
│  │ [Search...▼] │ │ [YYYY-MM-DD] │ │ [YYYY-MM-DD] │ │ [10▼]   │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────┘  │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Timestamp       │ User  │ Action │ Entity │ Changes          │ │
│  ├─────────────────────────────────────────────────────────────────┤
│  │ 2024-01-15 10:30│ User1 │ UPDATE │ Customer│ {email: ...}   │ │
│  │ 2024-01-14 15:20│ User1 │ CREATE │ Order   │ {orderId: ...} │ │
│  │ 2024-01-13 09:15│ User1 │ DELETE │ Product │ {productId:...}│ │
│  │ 2024-01-12 14:45│ User1 │ UPDATE │ Profile │ {phone: ...}   │ │
│  │ 2024-01-11 11:30│ User1 │ CREATE │ Comment │ {text: ...}    │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│              [Previous]  Page 1 of 5  [Next]                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Features

### 1. User Search Field
- **Type**: Autocomplete text input
- **Behavior**: 
  - Debounced search (300ms)
  - Minimum 2 characters to trigger search
  - Displays dropdown with matching users
  - Click to select user
- **API**: `POST /api/User/SearchUserByPartialName`
- **Payload**: `{ data: "search string" }`

### 2. Date Filters
- **From Date**: HTML5 date picker
- **To Date**: HTML5 date picker
- **Behavior**: Automatically refetches data when changed

### 3. Pagination Controls
- **Page Size Selector**: Dropdown with options (10, 25, 50, 100)
- **Navigation**: Previous/Next buttons
- **Display**: Shows current page and total pages
- **Behavior**: 
  - Resets to page 1 when filters change
  - Automatically fetches new data on page change

### 4. Data Table
- **Columns**:
  - Timestamp (formatted as locale string)
  - User (from response data)
  - Action (e.g., CREATE, UPDATE, DELETE)
  - Entity (entity type affected)
  - Changes (JSON stringified or raw data)
- **Behavior**: Updates automatically when filters change

### 5. Loading & Error States
- Loading indicator displayed during API calls
- Error messages shown if API calls fail
- Helpful messages when no data is available

## API Integration

### Search Users
```javascript
POST /api/User/SearchUserByPartialName
Content-Type: application/json

{
  "data": "john"
}
```

Response: Array of user objects
```javascript
[
  { "id": "1", "name": "John Doe", "username": "johndoe" },
  ...
]
```

### Fetch Audit Logs
```javascript
POST /api/AuditLog/SearchChangesForUser
Content-Type: application/json

{
  "userId": "selected-user-id",
  "fromDate": "2024-01-01",
  "toDate": "2024-01-31",
  "page": 1,
  "pageSize": 10
}
```

Response: Object with items array and optional totalCount
```javascript
{
  "items": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "userId": "1",
      "user": "John Doe",
      "action": "UPDATE",
      "entity": "Customer",
      "changes": { ... }
    },
    ...
  ],
  "totalCount": 50
}
```

## State Management

The component uses React hooks to manage state:
- `selectedUserId` - Currently selected user ID
- `searchString` - User search input value
- `users` - List of users from search
- `selectedFromDate` - Start date filter
- `selectedToDate` - End date filter
- `currentPage` - Current page number
- `currentPageSize` - Number of items per page
- `auditData` - Array of audit log entries
- `loading` - Loading state indicator
- `error` - Error message (if any)

## Automatic Updates

The component automatically refetches audit data when any of these change:
- `selectedUserId`
- `selectedFromDate`
- `selectedToDate`
- `currentPage`
- `currentPageSize`
