export default function LoadingSpinner({ theme }: { theme: string }) {
  return (
    <div
      className={`h-screen w-screen flex items-center justify-center ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <div className="w-16 mr-[350px] h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}