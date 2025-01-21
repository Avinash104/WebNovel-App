import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const handleLike = async (
  userId: string,
  commentId: string,
  responseType: "like" | "dislike"
) => {
  try {
    // Fetch the comment
    console.log("inside handleLike")
    const comment = await prismadb.comment.findUnique({
      where: { id: commentId },
      select: {
        likes: true,
        dislikes: true,
        likingUsers: true,
        dislikingUsers: true,
      },
    })

    if (!comment) {
      return new NextResponse("Comment not found.", { status: 404 })
    }

    // Determine if the user has already liked or disliked the comment
    const hasLiked = comment.likingUsers.includes(userId)
    const hasDisliked = comment.dislikingUsers.includes(userId)

    console.log("has liked disliked values: ", hasDisliked, hasLiked)
    let updatedComment

    if (responseType === "like") {
      console.log("inside like ")
      if (hasLiked) {
        // If already liked, remove the like
        updatedComment = await prismadb.comment.update({
          where: { id: commentId },
          data: {
            likes: comment.likes - 1,
            likingUsers: {
              set: comment.likingUsers.filter(
                (user: string) => user !== userId
              ),
            },
          },
        })

        return NextResponse.json(updatedComment)
      }

      // If disliked, remove the dislike and then like
      if (hasDisliked) {
        updatedComment = await prismadb.comment.update({
          where: { id: commentId },
          data: {
            dislikes: comment.dislikes - 1,
            dislikingUsers: {
              set: comment.dislikingUsers.filter(
                (user: string) => user !== userId
              ),
            },
            likes: comment.likes + 1,
            likingUsers: { push: userId },
          },
        })

        return NextResponse.json(updatedComment)
      }

      console.log("updating commnet")
      // Add the like
      updatedComment = await prismadb.comment.update({
        where: { id: commentId },
        data: {
          likes: comment.likes + 1,
          likingUsers: { push: userId },
        },
      })

      return NextResponse.json(updatedComment)
    }

    if (responseType === "dislike") {
      if (hasDisliked) {
        // If already disliked, remove the dislike
        updatedComment = await prismadb.comment.update({
          where: { id: commentId },
          data: {
            dislikes: comment.dislikes - 1,
            dislikingUsers: {
              set: comment.dislikingUsers.filter(
                (user: string) => user !== userId
              ),
            },
          },
        })

        return NextResponse.json(updatedComment)
      }

      // If liked, remove the like and then dislike
      if (hasLiked) {
        updatedComment = await prismadb.comment.update({
          where: { id: commentId },
          data: {
            likes: comment.likes - 1,
            likingUsers: {
              set: comment.likingUsers.filter(
                (user: string) => user !== userId
              ),
            },
            dislikes: comment.dislikes + 1,
            dislikingUsers: { push: userId },
          },
        })

        return NextResponse.json(updatedComment)
      }

      // Add the dislike
      updatedComment = await prismadb.comment.update({
        where: { id: commentId },
        data: {
          dislikes: comment.dislikes + 1,
          dislikingUsers: { push: userId },
        },
      })

      return NextResponse.json(updatedComment)
    }

    return new NextResponse("Invalid response type.", { status: 400 })
  } catch (error) {
    console.error("Error handling like/dislike:", error)
    return new NextResponse("An unexpected error occurred.", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { commentId: string } }
) {
  try {
    const user = await currentUser()
    const commentId = params?.commentId

    console.log("comment :", commentId)
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    console.log("body  :", body)

    const { responseType, content } = body

    console.log("respnse type  :", responseType)
    const profile = await prismadb.profile.findUnique({
      where: {
        id: user.id,
      },
    })

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const comment = await prismadb.comment.findUnique({
      where: {
        id: commentId,
      },
    })

    if (!comment) {
      return new NextResponse("Comment not found", { status: 401 })
    }

    if (responseType) {
      handleLike(profile.id, commentId, responseType)
    }

    const updatedComment = await prismadb.comment.update({
      where: {
        id: comment.id,
      },
      data: {
        content,
      },
    })

    return NextResponse.json(updatedComment)
  } catch (error) {
    console.error("[COMMENT_PATCH_ERROR]", error.message)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
