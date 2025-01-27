import React, { useEffect, useState } from 'react';
import Board from './components/Board';
import GameInfo from './components/GameInfo';
import { useGameStore } from './store/gameStore';
import { useAuthStore } from './store/authStore';

function App() {
  const initializeGame = useGameStore(state => state.initializeGame);
  const { user, initialize, loading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore(state => state.login);
  const register = useAuthStore(state => state.register);
  const logout = useAuthStore(state => state.logout);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (user) {
      initializeGame();
    }
  }, [user, initializeGame]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (isRegistering) {
        await register({ email, password, username });
      } else {
        await login({ email, password });
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center p-8">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-3xl font-bold text-amber-900 mb-6 text-center">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-amber-700">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full rounded-md border-amber-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200"
                  required
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-amber-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-amber-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-amber-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-amber-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              {isRegistering ? 'Register' : 'Login'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-amber-600">
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
              }}
              className="font-medium hover:text-amber-800"
            >
              {isRegistering ? 'Login' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-amber-900 mb-2">Checkers</h1>
        <div className="flex items-center gap-4">
          <p className="text-amber-700">Welcome, {user.username}!</p>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex flex-col lg:flex-row items-start gap-8">
        <Board />
        <div className="flex flex-col gap-4">
          <GameInfo />
          <button
            onClick={initializeGame}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            New Game
          </button>
        </div>
      </main>
    </div>
  );
}

export default App