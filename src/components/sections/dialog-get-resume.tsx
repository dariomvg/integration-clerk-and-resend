"use client"

import { Mail } from "lucide-react";
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
import { ebookResumes } from "@/lib/config";
import { sendEmail } from "@/lib/resend/actions";

export function DialogGetResume({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  async function handleSubmit(formData: FormData) {
    const email = formData.get("resume-email") as string;
    const resume = ebookResumes.find((r) => r.slug === slug)?.resume;
    if (!resume) return;

    const result = await sendEmail({
      to: email,
      subject: `Resume of ${title}`,
      text: resume,
    });

    if (!result.success) {
      console.error(result.error.type, result.error.message);
    }
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Mail />
            Get resume
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Get the resume</DialogTitle>
          <DialogDescription>
            We&apos;ll send the resume of &quot;{title}&quot; to your inbox.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="slug" value={slug} />

          <div className="space-y-2">
            <Label htmlFor="resume-email">Email</Label>
            <Input
              id="resume-email"
              name="resume-email"
              type="email"
              placeholder="you@email.com"
              required
            />
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full sm:w-auto">
              Send resume
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
