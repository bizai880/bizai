// Simple login page without dynamic features
export default function LoginPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Login</h1>
      <form>
        <div>
          <label>Email:</label>
          <input type="email" />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

// Disable SSR if it's causing issues
export const dynamic = 'force-static';
