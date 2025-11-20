# Frontend Integration Guide

## Quick Integration Steps

### 1. Environment Manager Integration

**Location**: Add to Settings page or Testing page

**In Settings.jsx or Testing.jsx**:
```jsx
import EnvironmentManager from '../components/EnvironmentManager';
import { useState } from 'react';

// Add state
const [envManagerOpen, setEnvManagerOpen] = useState(false);
const [selectedEnvironment, setSelectedEnvironment] = useState(null);

// Add button to open
<Button onClick={() => setEnvManagerOpen(true)}>
  Manage Environments
</Button>

// Add component
<EnvironmentManager
  open={envManagerOpen}
  onClose={() => setEnvManagerOpen(false)}
  onSelectEnvironment={(env) => setSelectedEnvironment(env)}
/>
```

### 2. Batch Runner Integration

**Location**: Add to Testing page or Collections panel

**In TestingDashboard.jsx or CollectionsPanel.jsx**:
```jsx
import BatchRunner from '../components/BatchRunner';
import { useState } from 'react';

// Add state
const [batchRunnerOpen, setBatchRunnerOpen] = useState(false);

// Add button (e.g., in CollectionsPanel header)
<Button
  onClick={() => setBatchRunnerOpen(true)}
  startIcon={<PlayArrow />}
>
  Run Batch
</Button>

// Add component
<BatchRunner
  open={batchRunnerOpen}
  onClose={() => setBatchRunnerOpen(false)}
  requests={selectedRequests} // Optional: pre-populate with selected requests
/>
```

### 3. Environment Variable Resolution in RequestEditor

**To enable environment variable substitution**:

```jsx
// In RequestEditor.jsx, add environment variable resolution
import { EnvironmentsService } from '../../services/apiService'; // Add method if needed

// Before sending request, resolve variables
const resolvedRequest = selectedEnvironment 
  ? EnvironmentsService.resolveRequestVariables(request, selectedEnvironment.variables)
  : request;
```

---

## Summary

All backend features are implemented and tested ✅
Frontend components are created and ready ✅
Integration is straightforward - just add the components to appropriate pages ✅

