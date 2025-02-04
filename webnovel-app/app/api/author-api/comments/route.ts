import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()

    const {
      content,
      chapterId,
      storyId,
      authorId,
      storeItemId,
      reviewId,
      commentType,
      parentId,
    } = body

    const profile = await prismadb.profile.findUnique({
      where: {
        id: user.id,
      },
    })

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    console.log(body)

    if (parentId) {
      console.log("inside reply")

      let newReply
      if (parentId && chapterId) {
        console.log("chapter reply")
        newReply = await prismadb.comment.create({
          data: {
            poster: profile.username,
            commentType,
            content,
            isReply: true,
            chapter: {
              connect: {
                id: chapterId,
              },
            },
            user: {
              connect: {
                id: user.id,
              },
            },
            parent: {
              connect: {
                id: parentId,
              },
            },
          },
        })

        return NextResponse.json(newReply, { status: 200 })
      }

      if (parentId && storyId) {
        console.log("story reply")
        newReply = await prismadb.comment.create({
          data: {
            poster: profile.username,
            commentType,
            content,
            isReply: true,
            story: {
              connect: {
                id: storyId,
              },
            },
            user: {
              connect: {
                id: user.id,
              },
            },
            parent: {
              connect: {
                id: parentId,
              },
            },
          },
        })

        return NextResponse.json(newReply, { status: 200 })
      }

      if (parentId && authorId) {
        console.log("profile wall reply")
        newReply = await prismadb.comment.create({
          data: {
            poster: profile.username,
            commentType,
            content,
            isReply: true,
            author: {
              connect: {
                id: authorId,
              },
            },
            user: {
              connect: {
                id: user.id,
              },
            },
            parent: {
              connect: {
                id: parentId,
              },
            },
          },
        })

        return NextResponse.json(newReply, { status: 200 })
      }

      if (parentId && storeItemId) {
        console.log("store item reply")
        newReply = await prismadb.comment.create({
          data: {
            poster: profile.username,
            commentType,
            content,
            isReply: true,
            storeItem: {
              connect: {
                id: storeItemId,
              },
            },
            user: {
              connect: {
                id: user.id,
              },
            },
            parent: {
              connect: {
                id: parentId,
              },
            },
          },
        })

        return NextResponse.json(newReply, { status: 200 })
      }

      if (parentId && reviewId) {
        console.log("store item reply")
        newReply = await prismadb.comment.create({
          data: {
            poster: profile.username,
            commentType,
            content,
            isReply: true,
            storeItem: {
              connect: {
                id: reviewId,
              },
            },
            user: {
              connect: {
                id: user.id,
              },
            },
            parent: {
              connect: {
                id: parentId,
              },
            },
          },
        })

        return NextResponse.json(newReply, { status: 200 })
      }
    }

    let newComment
    if (chapterId) {
      newComment = await prismadb.comment.create({
        data: {
          poster: profile.username,
          commentType,
          content,
          chapter: {
            connect: {
              id: chapterId,
            },
          },
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      })

      return NextResponse.json(newComment, { status: 200 })
    }

    if (storyId) {
      newComment = await prismadb.comment.create({
        data: {
          poster: profile.username,
          commentType,
          content,
          story: {
            connect: {
              id: storyId,
            },
          },
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      })

      return NextResponse.json(newComment, { status: 200 })
    }

    if (authorId) {
      newComment = await prismadb.comment.create({
        data: {
          poster: profile.username,
          commentType,
          content,
          author: {
            connect: {
              id: authorId,
            },
          },
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      })

      return NextResponse.json(newComment, { status: 200 })
    }

    if (storeItemId) {
      newComment = await prismadb.comment.create({
        data: {
          poster: profile.username,
          commentType,
          content,
          storeItem: {
            connect: {
              id: storeItemId,
            },
          },
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      })

      return NextResponse.json(newComment, { status: 200 })
    }

    if (reviewId) {
      newComment = await prismadb.comment.create({
        data: {
          poster: profile.username,
          commentType,
          content,
          storeItem: {
            connect: {
              id: reviewId,
            },
          },
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      })

      return NextResponse.json(newComment, { status: 200 })
    }
  } catch (error) {
    console.error("[MEMBERSHIP_POST_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
