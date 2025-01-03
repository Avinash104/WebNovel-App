import { redirect } from "next/navigation"

export default function ProfileStoryRedirect({
  params,
}: {
  params: { profileId: string; storyId: string }
}) {
  const { profileId, storyId } = params
  if (!storyId) {
    redirect(`/${profileId}/story`)
  }
  redirect(`/${profileId}/${storyId}/chapters`)
}
