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

```tsx
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
    "userId": 1,
    "fullName": "John Doe"
  },
  {
    "userId": 2,
    "fullName": "Jane Smith"
  }
]
```

**Required Fields:**
- `userId` (number) - Unique user identifier
- `fullName` (string) - User's full name

### 2. Audit Log Search Endpoint

**Endpoint:** `POST /api/AuditLog/GetAuditChangeLogsByUserId`

**Request Body:**
```json
{
  "userId": 123,
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
      "schemaName": "dbo",
      "tableName": "Customers",
      "keyValue": 1001,
      "changedByUser": 123,
      "userName": "John Doe",
      "changeDate": "2024-01-15T10:30:00Z",
      "changeType": "UPDATE",
      "entity": "Customer",
      "diffJson": "{\"field\":\"email\",\"oldValue\":\"old@example.com\",\"newValue\":\"new@example.com\"}",
      "diffText": "Email changed from old@example.com to new@example.com"
    }
  ],
  "totalCount": 50
}
```

**Required Fields (based on C# AuditLog model):**
- `schemaName` (string) - Database schema name
- `tableName` (string) - Table name
- `keyValue` (number) - Primary key value
- `changedByUser` (number, nullable) - User ID who made the change
- `userName` (string) - User name who made the change
- `changeDate` (string) - ISO 8601 date string
- `changeType` (string) - Type of change (CREATE, UPDATE, DELETE, etc.)
- `diffJson` (string) - JSON string describing the changes
- `diffText` (string) - Human-readable text describing the changes

## API Implementation Examples

### Node.js/Express Example

```javascript
// User search endpoint
app.post('/api/User/SearchUserByPartialName', async (req, res) => {
  const { data } = req.body;
  
  // Search users in database
  const users = await db.users.find({
    fullName: { $regex: data, $options: 'i' }
  }).limit(10).select('userId fullName');
  
  res.json(users);
});

// Audit log search endpoint
app.post('/api/AuditLog/GetAuditChangeLogsByUserId', async (req, res) => {
  const { userId, fromDate, toDate, page, pageSize } = req.body;
  
  const query = { changedByUser: userId };
  if (fromDate) query.changeDate = { $gte: new Date(fromDate) };
  if (toDate) query.changeDate = { ...query.changeDate, $lte: new Date(toDate) };
  
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
        .Where(u => u.FullName.Contains(request.Data))
        .Take(10)
        .Select(u => new { u.UserId, u.FullName })
        .ToListAsync();
    
    return Ok(users);
}

[HttpPost("api/AuditLog/GetAuditChangeLogsByUserId")]
public async Task<IActionResult> SearchAuditLogs([FromBody] AuditSearchRequest request)
{
    var query = _context.AuditLogs.Where(a => a.ChangedByUser == request.UserId);
    
    if (!string.IsNullOrEmpty(request.FromDate))
        query = query.Where(a => a.ChangeDate >= DateTime.Parse(request.FromDate));
    
    if (!string.IsNullOrEmpty(request.ToDate))
        query = query.Where(a => a.ChangeDate <= DateTime.Parse(request.ToDate));
    
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
