import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/proto-lab/ui/tabs"

export default function TabsDemo() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="findings">Findings</TabsTrigger>
        <TabsTrigger value="next-steps">Next steps</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="pt-2">Goals, scope and the people involved.</TabsContent>
      <TabsContent value="findings" className="pt-2">What we learned from twelve interviews.</TabsContent>
      <TabsContent value="next-steps" className="pt-2">Owners and dates for the next sprint.</TabsContent>
    </Tabs>
  )
}
