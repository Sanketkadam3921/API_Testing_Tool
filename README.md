# 🚀 Professional API Testing Tool

A modern, professional-grade API testing tool inspired by Postman and Insomnia, built with React, Material-UI, Ant Design, and Express.js.

![API Testing Tool](https://via.placeholder.com/800x400/3f51b5/ffffff?text=API+Testing+Tool)

## ✨ Features

### 🎨 **Modern UI/UX**
- **Dark/Light Theme Toggle** - Professional dark mode with light mode option
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Material-UI + Ant Design** - Hybrid design system for polished look
- **Split Layout** - Request editor and response viewer side-by-side
- **Tabbed Workspace** - Multiple API requests open simultaneously

### 🔧 **Request Builder**
- **HTTP Methods** - GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
- **Dynamic Headers** - Add/remove custom headers with key-value pairs
- **Query Parameters** - Easy parameter management
- **JSON Body Editor** - Syntax-highlighted JSON editor with validation
- **URL Validation** - Real-time URL validation and formatting

### 📊 **Response Viewer**
- **Status Code Display** - Color-coded status indicators
- **Response Time** - Precise timing measurements
- **Response Size** - Automatic size calculation and formatting
- **Multiple Views** - Body, Headers, and Raw response tabs
- **Syntax Highlighting** - Beautiful JSON formatting
- **Copy to Clipboard** - One-click response copying

### 📚 **Collections & History**
- **Request Collections** - Organize requests into collections
- **Request History** - Automatic history tracking
- **Replay Requests** - One-click request replay from history
- **Sample Collections** - Pre-built collections for testing

### 🔒 **Security & Performance**
- **Rate Limiting** - Built-in rate limiting protection
- **Input Validation** - Comprehensive request validation
- **Error Handling** - Graceful error handling and reporting
- **Request Timeout** - Configurable timeout settings
- **CORS Support** - Proper CORS configuration

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with hooks
- **Material-UI (MUI)** - Component library
- **Ant Design** - Additional UI components
- **Zustand** - State management
- **React Router** - Client-side routing
- **React Hot Toast** - Notifications
- **React Ace** - Code editor
- **React Syntax Highlighter** - Code highlighting

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Winston** - Logging
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting
- **Express Validator** - Input validation
- **Axios** - HTTP client

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd apitesting
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend/apitesting
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # Backend .env
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start the development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend/apitesting
   npm run dev
   ```

6. **Open your browser**
   ```
   Frontend: http://localhost:5173
   Backend: http://localhost:3000
   ```

## 📖 Usage Guide

### Making Your First Request

1. **Open the application** in your browser
2. **Select HTTP method** from the dropdown (GET, POST, etc.)
3. **Enter the URL** in the URL field
4. **Add headers** (optional) using the Headers section
5. **Add query parameters** (optional) using the Parameters section
6. **Add request body** (for POST/PUT/PATCH) using the Body section
7. **Click "Send Request"** to execute the request
8. **View the response** in the Response panel

### Working with Collections

1. **Browse sample collections** in the left sidebar
2. **Click the play button** next to any request to run it
3. **Create new collections** using the "New" button
4. **Organize your requests** into logical groups

### Managing History

1. **View request history** in the History panel
2. **Replay any previous request** by clicking the play button
3. **Clear history** using the "Clear" button

## 🎨 UI Screenshots

### Dark Mode Interface
![Dark Mode](https://via.placeholder.com/600x400/121212/ffffff?text=Dark+Mode+Interface)

### Light Mode Interface  
![Light Mode](https://via.placeholder.com/600x400/f8f9fa/212121?text=Light+Mode+Interface)

### Response Viewer
![Response Viewer](https://via.placeholder.com/600x400/1e1e1e/ffffff?text=Response+Viewer)

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=5432
DB_NAME=apitesting
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3000
```

### Customization

- **Theme colors** can be modified in `src/context/ThemeContext.jsx`
- **Request timeout** can be adjusted in `src/services/apiService.js`
- **Rate limiting** can be configured in `backend/src/app.js`

## 🚧 Future Enhancements (Phase 2)

- **Uptime Monitoring** - Continuous API health monitoring
- **Team Collaboration** - Share collections with team members
- **API Documentation** - Generate documentation from requests
- **Environment Variables** - Dynamic environment management
- **GraphQL Support** - GraphQL query testing
- **WebSocket Testing** - Real-time connection testing
- **Import/Export** - Postman collection import/export
- **Automated Testing** - Test suite creation and execution

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Postman](https://postman.com) and [Insomnia](https://insomnia.rest)
- Built with [Material-UI](https://mui.com) and [Ant Design](https://ant.design)
- Powered by [React](https://reactjs.org) and [Express.js](https://expressjs.com)

---

**Made with ❤️ for developers who love testing APIs**
