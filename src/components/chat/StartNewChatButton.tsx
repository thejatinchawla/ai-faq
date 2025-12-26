'use client';

import { useRouter } from "next/navigation";

type StartNewChatButtonProps = {
  className?: string;
};

export function StartNewChatButton({ className }: StartNewChatButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push("/dashboard/support?new=1");
    window.location.reload();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
    >
      Start new chat
    </button>
  );
}

