import { redirect } from "next/navigation"

export default function ProfileRedirect({
  params,
}: {
  params: { profileId: string; storyId: string }
}) {
  const { profileId, storyId } = params
  if (!storyId) {
    redirect(`/admin/${profileId}/story`)
  }
  redirect(`/admin/${profileId}/profile`)
}
