import { ModeToggle } from "@/components/mode-toggle";
import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="text-3xl font-bold text-gray-400">
      Timbre
      <UserButton
        afterSignOutUrl="/"
      />
      <ModeToggle />
    </div>
  );
}
