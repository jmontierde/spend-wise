export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a7ea4] dark:border-[#4db8db]" />
    </div>
  );
}
