import { AppearanceCard } from "@/components/showcase/settings/appearance-card"
import { DangerCard } from "@/components/showcase/settings/danger-card"
import { HoursCard } from "@/components/showcase/settings/hours-card"
import { IntegrationsCard } from "@/components/showcase/settings/integrations-card"
import { InviteCard } from "@/components/showcase/settings/invite-card"
import { NotificationsCard } from "@/components/showcase/settings/notifications-card"
import { ProfileCard } from "@/components/showcase/settings/profile-card"
import { SecurityCard } from "@/components/showcase/settings/security-card"
import { ShortcutsCard } from "@/components/showcase/settings/shortcuts-card"
import { TeamCard } from "@/components/showcase/settings/team-card"

const cards = [
  { id: "profile", Component: ProfileCard },
  { id: "notifications", Component: NotificationsCard },
  { id: "team", Component: TeamCard },
  { id: "security", Component: SecurityCard },
  { id: "hours", Component: HoursCard },
  { id: "integrations", Component: IntegrationsCard },
  { id: "invite", Component: InviteCard },
  { id: "appearance", Component: AppearanceCard },
  { id: "shortcuts", Component: ShortcutsCard },
  { id: "danger", Component: DangerCard },
]

export function Settings() {
  return (
    <section aria-label="Account and workspace settings" className="columns-1 gap-6 md:columns-2 xl:columns-3">
      {cards.map(({ id, Component }) => (
        <div key={id} className="mb-6 break-inside-avoid">
          <Component />
        </div>
      ))}
    </section>
  )
}
