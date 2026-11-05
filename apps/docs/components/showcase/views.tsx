import { Settings } from "@/components/showcase/settings"
import { Workspace } from "@/components/showcase/workspace"

// The two assembled screens on their own, for the /view route and the
// pattern detail preview.
export function WorkspaceView() {
  return (
    <main className="mx-auto w-full max-w-screen-2xl p-4 md:p-8">
      <Workspace />
    </main>
  )
}

export function SettingsView() {
  return (
    <main className="mx-auto w-full max-w-screen-2xl p-4 md:p-8">
      <Settings />
    </main>
  )
}
