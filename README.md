# Audit Change Log

A React component for viewing and filtering audit logs with user search, date filtering, and pagination support.

## Features

- **User Search**: Searchable user field that fetches users from the API as you type
- **Date Filtering**: Select from and to dates to filter audit logs
- **Pagination**: Navigate through audit data with configurable page sizes (10, 25, 50, 100)
- **Real-time Updates**: Automatically fetches audit data when filters change
- **Responsive Design**: Clean, table-based layout for audit log entries

## Installation

```bash
npm install
```

## Build

```bash
# Production build
npm run build

# Development build with watch mode
npm run dev
```

## Usage

### As a standalone component

```jsx
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
- **Response**: Array of user objects with at least an `id` property and optionally `name` or `username`

### 2. Search Audit Logs
- **Endpoint**: `POST /api/AuditLog/SearchChangesForUser`
- **Payload**:
  ```json
  {
    "userId": "selected user id",
    "fromDate": "YYYY-MM-DD",
    "toDate": "YYYY-MM-DD",
    "page": 1,
    "pageSize": 10
  }
  ```
- **Response**: Array of audit log entries or an object with `items` array and optional `totalCount` for pagination

### Expected Audit Log Data Structure

Each audit log entry can have the following properties:
- `timestamp`: ISO date string
- `user` or `userId`: User identifier
- `action`: Action performed
- `entity` or `entityType`: Entity affected
- `changes`: Object or string describing the changes

## Development

```bash
# Lint the code
npm run lint
```

## Component Props

The `AuditLog` component currently doesn't accept any props. All configuration is managed through internal state and user interaction.

## Browser Compatibility

The component is built with modern React (18+) and uses ES6+ features. It should work in all modern browsers.

## License

ISC
