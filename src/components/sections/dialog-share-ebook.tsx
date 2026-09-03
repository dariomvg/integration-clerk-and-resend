"use client"


import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendInvitation } from "@/lib/resend/actions";
import { getCurrentUser } from "@/lib/clerk/actions";
import { useState } from "react";


export function DialogShareEbook({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const [message, SetMessage] = useState<string>("");
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/ebooks/${slug}`;


  async function handleSubmit(formData: FormData) {
    const user = await getCurrentUser();
    if(!user.success) {
      throw new Error("User not authenticated");
    }
    const userName = user.data?.firstName || "Someone";
    const email = formData.get("share-email") as string;
    const message = formData.get("share-message") as string;
    const result = await sendInvitation(email , userName, link, message, title);
    if(result.success) {
      SetMessage("Email sent successfully!. Check your inbox(maybe spam).");
      setTimeout(() => {
        SetMessage("");
      }, 5000);
    } else {
      SetMessage(`Error sending email: ${result.error.message}`);
    }
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm">
          <Share2 />
          Share
        </Button>} 
        />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share this ebook</DialogTitle>
          <DialogDescription>
            Send &quot;{title}&quot; to someone by email.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="slug" value={slug} />

          <div className="space-y-2">
            <Label htmlFor="share-email">Recipient email</Label>
            <Input
              id="share-email"
              name="share-email"
              type="email"
              placeholder="friend@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="share-message">Message</Label>
            <Textarea
              id="share-message"
              name="share-message"
              placeholder="I thought you'd like this one..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="share-link">Link</Label>
            <Input id="share-link" name="share-link" readOnly value={link} />
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full sm:w-auto">
              Send
            </Button>
          </DialogFooter>
          {message && (
            <div className="text-sm text-accent-foreground mt-2">{message}</div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}