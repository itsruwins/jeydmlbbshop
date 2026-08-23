"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { ICONS, IconButton } from "@/components/ui/IconButton";
import { useToast } from "@/components/ui/Toast";
import { setAccountFeatured } from "@/functions/accounts/setAccountFeatured";

/**
 * Featured on or off, from the table.
 *
 * The amber fill is one of the few places the accent is used as a fill rather
 * than an outline — featured is an interactive state, which is exactly what the
 * accent is reserved for. Off shows a hollow star rather than nothing, because
 * unlike the read-only mark this one has to be findable in order to be clicked.
 */
export function FeaturedToggle({
  accountId,
  accountReference,
  isFeatured,
}: {
  accountId: string;
  accountReference: string;
  isFeatured: boolean;
}) {
  const [featured, setFeatured] = useState(isFeatured);
  const [saving, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  const toggle = () => {
    const next = !featured;
    setFeatured(next);

    startTransition(async () => {
      const result = await setAccountFeatured(accountId, next);

      if (!result.ok) {
        setFeatured(!next);
        toast.error(result.message);
        return;
      }

      router.refresh();
    });
  };

  return (
    <IconButton
      label={
        featured
          ? `Remove ${accountReference} from featured`
          : `Feature ${accountReference}`
      }
      title={featured ? "Featured" : "Not featured"}
      tone={featured ? "accent" : "default"}
      pressed={featured}
      disabled={saving}
      onClick={toggle}
    >
      {ICONS.star}
    </IconButton>
  );
}
