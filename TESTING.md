# Sistema de Tests Automáticos

## 📋 Tests para Verificar Funcionalidad

### Backend Tests

Instalar:
```bash
cd backend
npm install --save-dev jest supertest
```

Archivo `backend/__tests__/api.test.js`:
```javascript
const request = require('supertest');
const app = require('../server');

describe('API Tests', () => {
  test('GET /api/health returns OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('POST /api/auth/check validates email', async () => {
    const res = await request(app)
      .post('/api/auth/check')
      .send({ email: 'test@example.com' });
    expect(res.status).toBe(200);
  });
});
```

En `package.json`:
```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch"
}
```

Ejecutar:
```bash
npm test
```

### Frontend Tests

Instalar:
```bash
cd frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

Archivo `frontend/src/__tests__/App.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByRole('application')).toBeInTheDocument();
  });
});
```

En `frontend/package.json`:
```json
"scripts": {
  "test": "vitest",
  "test:ui": "vitest --ui"
}
```

