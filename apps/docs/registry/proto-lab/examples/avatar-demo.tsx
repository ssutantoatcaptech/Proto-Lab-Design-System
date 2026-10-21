import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/registry/proto-lab/ui/avatar"

const team = [
  { initials: "JM", name: "Jordan Miles" },
  { initials: "PR", name: "Priya Raman" },
  { initials: "LC", name: "Luis Chen" },
]

export default function AvatarDemo() {
  return (
    <div className="flex items-center gap-6">
      <Avatar size="lg">
        <AvatarFallback>AK</AvatarFallback>
        <AvatarBadge aria-label="Available" />
      </Avatar>
      <AvatarGroup aria-label="Engagement team">
        {team.map((person) => (
          <Avatar key={person.initials} title={person.name}>
            <AvatarFallback>{person.initials}</AvatarFallback>
          </Avatar>
        ))}
        <AvatarGroupCount>+4</AvatarGroupCount>
      </AvatarGroup>
    </div>
  )
}
