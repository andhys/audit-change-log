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
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ Change Date │ User Name │ Change Type │ Schema │ Table │ Key │ Diff │ │
│  ├─────────────────────────────────────────────────────────────────────┤
│  │ 2024-01-15  │ John Doe  │ UPDATE      │ dbo    │ Cust  │ 100 │ ... │ │
│  │ 2024-01-14  │ John Doe  │ CREATE      │ dbo    │ Order │ 200 │ ... │ │
│  │ 2024-01-13  │ John Doe  │ DELETE      │ dbo    │ Prod  │ 300 │ ... │ │
│  │ 2024-01-12  │ John Doe  │ UPDATE      │ dbo    │ Users │ 400 │ ... │ │
│  │ 2024-01-11  │ John Doe  │ CREATE      │ dbo    │ Comm  │ 500 │ ... │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
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
- **Columns** (based on C# AuditLog model):
  - Change Date (formatted as locale string)
  - User Name (userName from response)
  - Change Type (e.g., CREATE, UPDATE, DELETE)
  - Schema (schemaName)
  - Table (tableName)
  - Key Value (keyValue - primary key)
  - Diff (diffText or diffJson)
- **Behavior**: Updates automatically when filters change

### 5. Loading & Error States
- Loading indicator displayed during API calls
- Error messages shown if API calls fail
- Helpful messages when no data is available

## TypeScript Support

The component is written in TypeScript with strict type checking. Type definitions match the C# backend models:

```typescript
interface AuditLog {
  schemaName: string;
  tableName: string;
  keyValue: number;
  changedByUser: number | null;
  userName: string;
  changeDate: string;
  changeType: string;
  diffJson: string;
  diffText: string;
}

interface User {
  userId: number;
  fullName: string;
}
```

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
  { "userId": 1, "fullName": "John Doe" },
  ...
]
```

### Fetch Audit Logs
```javascript
POST /api/AuditLog/GetAuditChangeLogsByUserId
Content-Type: application/json

{
  "userId": 123,
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
      "schemaName": "dbo",
      "tableName": "Customers",
      "keyValue": 1001,
      "changedByUser": 123,
      "userName": "John Doe",
      "changeDate": "2024-01-15T10:30:00Z",
      "changeType": "UPDATE",
      "diffJson": "{\"field\":\"email\",\"old\":\"old@example.com\",\"new\":\"new@example.com\"}",
      "diffText": "Email changed from old@example.com to new@example.com"
    },
    ...
  ],
  "totalCount": 50
}
```

## State Management

The component uses React hooks with TypeScript to manage state:
- `selectedUserId: number | null` - Currently selected user ID
- `searchString: string` - User search input value
- `users: User[]` - List of users from search
- `selectedFromDate: string` - Start date filter
- `selectedToDate: string` - End date filter
- `currentPage: number` - Current page number
- `currentPageSize: number` - Number of items per page
- `auditData: AuditLog[]` - Array of audit log entries
- `loading: boolean` - Loading state indicator
- `error: string | null` - Error message (if any)

## Automatic Updates

The component automatically refetches audit data when any of these change:
- `selectedUserId`
- `selectedFromDate`
- `selectedToDate`
- `currentPage`
- `currentPageSize`
