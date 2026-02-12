"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body className="flex h-screen items-center justify-center bg-white font-sans">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-800">
            오류가 발생했습니다
          </h1>
          <p className="mb-6 text-gray-500">
            예상치 못한 문제가 발생했습니다. 다시 시도해주세요.
          </p>
          <button
            onClick={reset}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
