import { signInWithGoogle } from "@/lib/firebase/auth";

export default function Login() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 100 }}>
      <h1>تسجيل الدخول</h1>
      <button
        style={{ padding: '10px 20px', marginTop: 20, background: '#4285F4', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        onClick={() => signInWithGoogle}
      >
        تسجيل الدخول باستخدام Google
      </button>
    </div>
  );
}
