# Audit Change Log

A TypeScript React component with Material-UI for viewing and filtering audit logs with user search, date filtering, and pagination support.

## Features

- **TypeScript**: Full type safety with strict mode and type definitions matching C# backend models
- **Material-UI**: Professional Material Design interface with responsive components
- **User Search**: Autocomplete field with debounced API calls as you type
- **Date Filtering**: Material-UI date pickers for from/to date selection
- **Pagination**: MUI Pagination component with configurable page sizes (10, 25, 50, 100)
- **Real-time Updates**: Automatically fetches audit data when filters change
- **Responsive Design**: Mobile-friendly layout with Material-UI components

## Installation

```bash
npm install
```

### Peer Dependencies

This component requires the following peer dependencies:

```bash
npm install react react-dom @mui/material @emotion/react @emotion/styled
```

## Build

```bash
# Production build
npm run build

# Development build with watch mode
npm run dev

# Type checking
npm run type-check
```

## Usage

### As a standalone component

```tsx
import AuditLog from 'audit-change-log';

function App() {
  return <AuditLog />;
}
```

### In an HTML file

See `example.html` for a complete example of using the component in a plain HTML file.

## API Endpoints

The component expects the following API endpoints to be available:

### 1. Search Users
- **Endpoint**: `POST /api/User/SearchUserByPartialName`
- **Payload**: 
  ```json
  {
    "data": "search string"
  }
  ```
- **Response**: Array of user objects with `userId` (number) and `fullName` (string)
  ```json
  [
    { "userId": 1, "fullName": "John Doe" },
    { "userId": 2, "fullName": "Jane Smith" }
  ]
  ```

### 2. Search Audit Logs
- **Endpoint**: `POST /api/AuditLog/GetAuditChangeLogsByUserId`
- **Payload**:
  ```json
  {
    "userId": 123,
    "fromDate": "YYYY-MM-DD",
    "toDate": "YYYY-MM-DD",
    "page": 1,
    "pageSize": 10
  }
  ```
- **Response**: Array of audit log entries or an object with `items` array and optional `totalCount` for pagination
  ```json
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
      }
    ],
    "totalCount": 50
  }
  ```

### Expected Audit Log Data Structure

Each audit log entry has the following properties (based on C# model):
- `schemaName`: Database schema name
- `tableName`: Table name
- `keyValue`: Primary key value
- `changedByUser`: User ID who made the change (nullable)
- `userName`: User name who made the change
- `changeDate`: ISO date string
- `changeType`: Type of change (CREATE, UPDATE, DELETE, etc.)
- `diffJson`: JSON string describing the changes
- `diffText`: Human-readable text describing the changes

## TypeScript Support

The component is written in TypeScript and includes type definitions. Import types:

```tsx
import AuditLog, { AuditLogType, User, AuditSearchRequest, AuditSearchResponse } from 'audit-change-log';
```

## Development

```bash
# Lint the code
npm run lint

# Type check
npm run type-check
```

## Component Props

The `AuditLog` component currently doesn't accept any props. All configuration is managed through internal state and user interaction.

## Browser Compatibility

The component is built with modern React (18+) and uses ES6+ features. It should work in all modern browsers.

## License

ISC
