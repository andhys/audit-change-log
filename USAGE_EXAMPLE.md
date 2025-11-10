# AuditLog Component - Usage Examples

## Installation and Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Component
```bash
npm run build
```

This creates `dist/bundle.js` which can be used in your application.

## Usage Examples

### Example 1: Basic Usage in React Application

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import AuditLog from 'audit-change-log';

function App() {
  return (
    <div className="app">
      <AuditLog />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

### Example 2: In a Next.js Application

```jsx
// pages/audit.js
import dynamic from 'next/dynamic';

const AuditLog = dynamic(() => import('audit-change-log'), {
  ssr: false
});

export default function AuditPage() {
  return (
    <div>
      <h1>Audit Logs</h1>
      <AuditLog />
    </div>
  );
}
```

### Example 3: Using the UMD Build in HTML

```html
<!DOCTYPE html>
<html>
<head>
    <title>Audit Logs</title>
</head>
<body>
    <div id="root"></div>
    
    <!-- React and ReactDOM -->
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    
    <!-- AuditLog component -->
    <script src="path/to/audit-change-log/dist/bundle.js"></script>
    
    <script>
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(AuditChangeLog.default));
    </script>
</body>
</html>
```

## Backend API Requirements

Your backend must implement these two endpoints:

### 1. User Search Endpoint

**Endpoint:** `POST /api/User/SearchUserByPartialName`

**Request Body:**
```json
{
  "data": "search string"
}
```

**Response:** Array of user objects
```json
[
  {
    "id": "user-id-1",
    "name": "John Doe",
    "username": "johndoe"
  },
  {
    "id": "user-id-2",
    "name": "Jane Smith",
    "username": "janesmith"
  }
]
```

**Required Fields:**
- `id` (string) - Unique user identifier

**Optional Fields:**
- `name` (string) - User's display name
- `username` (string) - User's username

### 2. Audit Log Search Endpoint

**Endpoint:** `POST /api/AuditLog/SearchChangesForUser`

**Request Body:**
```json
{
  "userId": "selected-user-id",
  "fromDate": "2024-01-01",
  "toDate": "2024-01-31",
  "page": 1,
  "pageSize": 10
}
```

**Response:** Object with audit log items
```json
{
  "items": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "userId": "user-id-1",
      "user": "John Doe",
      "action": "UPDATE",
      "entity": "Customer",
      "entityType": "Customer",
      "changes": {
        "field": "email",
        "oldValue": "old@example.com",
        "newValue": "new@example.com"
      }
    }
  ],
  "totalCount": 50
}
```

**Alternative Response:** Simple array (if pagination info is in headers)
```json
[
  {
    "timestamp": "2024-01-15T10:30:00Z",
    "userId": "user-id-1",
    "action": "UPDATE",
    "entity": "Customer",
    "changes": {...}
  }
]
```

**Required Fields:**
- `timestamp` (string) - ISO 8601 date string
- `action` (string) - Action performed (e.g., CREATE, UPDATE, DELETE)

**Optional Fields:**
- `user` or `userId` (string) - User who performed the action
- `entity` or `entityType` (string) - Type of entity affected
- `changes` (object/string) - Description of changes made
- `totalCount` (number) - Total number of records (for pagination)

## API Implementation Examples

### Node.js/Express Example

```javascript
// User search endpoint
app.post('/api/User/SearchUserByPartialName', async (req, res) => {
  const { data } = req.body;
  
  // Search users in database
  const users = await db.users.find({
    $or: [
      { name: { $regex: data, $options: 'i' } },
      { username: { $regex: data, $options: 'i' } }
    ]
  }).limit(10);
  
  res.json(users);
});

// Audit log search endpoint
app.post('/api/AuditLog/SearchChangesForUser', async (req, res) => {
  const { userId, fromDate, toDate, page, pageSize } = req.body;
  
  const query = { userId };
  if (fromDate) query.timestamp = { $gte: new Date(fromDate) };
  if (toDate) query.timestamp = { ...query.timestamp, $lte: new Date(toDate) };
  
  const skip = (page - 1) * pageSize;
  
  const [items, totalCount] = await Promise.all([
    db.auditLogs.find(query).skip(skip).limit(pageSize),
    db.auditLogs.countDocuments(query)
  ]);
  
  res.json({ items, totalCount });
});
```

### ASP.NET Core Example

```csharp
[HttpPost("api/User/SearchUserByPartialName")]
public async Task<IActionResult> SearchUsers([FromBody] SearchRequest request)
{
    var users = await _context.Users
        .Where(u => u.Name.Contains(request.Data) || u.Username.Contains(request.Data))
        .Take(10)
        .ToListAsync();
    
    return Ok(users);
}

[HttpPost("api/AuditLog/SearchChangesForUser")]
public async Task<IActionResult> SearchAuditLogs([FromBody] AuditSearchRequest request)
{
    var query = _context.AuditLogs.Where(a => a.UserId == request.UserId);
    
    if (!string.IsNullOrEmpty(request.FromDate))
        query = query.Where(a => a.Timestamp >= DateTime.Parse(request.FromDate));
    
    if (!string.IsNullOrEmpty(request.ToDate))
        query = query.Where(a => a.Timestamp <= DateTime.Parse(request.ToDate));
    
    var totalCount = await query.CountAsync();
    var items = await query
        .Skip((request.Page - 1) * request.PageSize)
        .Take(request.PageSize)
        .ToListAsync();
    
    return Ok(new { items, totalCount });
}
```

## Testing with Mock API

See `demo.html` for a complete example with mock API data that you can use for testing without a backend.

## Development Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Build for development with watch mode
npm run dev

# Lint code
npm run lint

# Validate component structure
node validate.js
```
