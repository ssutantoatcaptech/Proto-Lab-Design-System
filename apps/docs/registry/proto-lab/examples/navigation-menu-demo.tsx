import {
  NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink,
  NavigationMenuList, NavigationMenuTrigger,
} from "@/registry/proto-lab/ui/navigation-menu"

const practices = [
  { title: "Customer Experience", description: "Research, journey mapping and service design." },
  { title: "Data & Analytics", description: "Platforms, reporting and machine learning." },
  { title: "Management Consulting", description: "Strategy, operating models and change." },
  { title: "Systems Integration", description: "Cloud, APIs and enterprise platforms." },
]

export default function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Practices</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-96 grid-cols-2 gap-1">
              {practices.map((p) => (
                <li key={p.title}>
                  <NavigationMenuLink href="#" className="flex-col items-start gap-1">
                    <span className="font-medium">{p.title}</span>
                    <span className="text-muted-foreground">{p.description}</span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" className="h-9 px-3 font-medium">Engagements</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" className="h-9 px-3 font-medium">Timesheets</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
