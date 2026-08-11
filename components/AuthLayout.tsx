export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FBF4EC] p-10">
      {children}
    </div>
  );
}
